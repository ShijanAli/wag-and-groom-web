"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/common/Markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { uploadsApi, validateImage, type UploadFolder } from "@/features/uploads/api";
import { ChoiceShell } from "./choice-fields";

type Edit = (text: string, start: number, end: number) => { text: string; selStart: number; selEnd: number };

/** Wraps the selection (or a placeholder) with before/after markers. */
const wrap =
  (before: string, after = before, placeholder = "text"): Edit =>
  (text, s, e) => {
    const sel = text.slice(s, e) || placeholder;
    return { text: text.slice(0, s) + before + sel + after + text.slice(e), selStart: s + before.length, selEnd: s + before.length + sel.length };
  };

/** Prefixes every selected line (headings, lists, quotes). */
const prefixLines =
  (prefix: (i: number) => string): Edit =>
  (text, s, e) => {
    const lineStart = text.lastIndexOf("\n", s - 1) + 1;
    const block = text.slice(lineStart, e) || "item";
    const out = block
      .split("\n")
      .map((l, i) => prefix(i) + l)
      .join("\n");
    return { text: text.slice(0, lineStart) + out + text.slice(e), selStart: lineStart, selEnd: lineStart + out.length };
  };

const TOOLS: { label: string; icon: typeof Bold; edit: Edit; keys?: string }[] = [
  { label: "Heading", icon: Heading2, edit: prefixLines(() => "## ") },
  { label: "Bold", icon: Bold, edit: wrap("**"), keys: "b" },
  { label: "Italic", icon: Italic, edit: wrap("_"), keys: "i" },
  { label: "Link", icon: Link2, edit: wrap("[", "](https://)", "link text"), keys: "k" },
  { label: "Bulleted list", icon: List, edit: prefixLines(() => "- ") },
  { label: "Numbered list", icon: ListOrdered, edit: prefixLines((i) => `${i + 1}. `) },
  { label: "Quote", icon: Quote, edit: prefixLines(() => "> ") },
];

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  folder?: UploadFolder;
  rows?: number;
  placeholder?: string;
  /** a11y wiring from the form field (label → textarea, description/error → aria-describedby) */
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

/** Markdown editor: toolbar + ⌘B/⌘I/⌘K shortcuts + inline image upload + live preview tab. */
export function MarkdownEditor({ value, onChange, onBlur, folder = "blog", rows = 16, placeholder, textareaProps }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const apply = (edit: Edit) => {
    const el = ref.current;
    if (!el) return;
    const r = edit(value, el.selectionStart, el.selectionEnd);
    onChange(r.text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.selStart, r.selEnd);
    });
  };

  const insertImage = async (file: File) => {
    const err = validateImage(file);
    if (err) return toast.error(err);
    setUploading(true);
    try {
      const { url } = await uploadsApi.image(file, folder);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      apply((text, s, e) => {
        const md = `\n![${alt}](${url})\n`;
        return { text: text.slice(0, s) + md + text.slice(e), selStart: s + md.length, selEnd: s + md.length };
      });
    } catch (e) {
      toast.error(getErrorMessage(e, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <Tabs defaultValue="write" className="overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-2 py-1.5">
        <TabsList className="h-8">
          <TabsTrigger value="write" className="h-6 text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="h-6 text-xs">
            Preview
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-0.5">
          {TOOLS.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.keys ? `${t.label} (⌘${t.keys.toUpperCase()})` : t.label}
              aria-label={t.label}
              onClick={() => apply(t.edit)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
          <button
            type="button"
            title="Insert image"
            aria-label="Insert image"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => (e.target.files?.[0] && insertImage(e.target.files[0]), (e.target.value = ""))} />
        </div>
      </div>
      <TabsContent value="write" className="m-0">
        <Textarea
          {...textareaProps}
          ref={ref}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            const tool = TOOLS.find((t) => t.keys === e.key.toLowerCase());
            if (tool) (e.preventDefault(), apply(tool.edit));
          }}
          className="resize-y rounded-none border-0 font-mono text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </TabsContent>
      <TabsContent value="preview" className={cn("m-0 overflow-y-auto px-5 py-4")} style={{ minHeight: `${rows * 1.6}rem` }}>
        {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
      </TabsContent>
      <p className="border-t px-3 py-1.5 text-right text-xs text-muted-foreground">
        Markdown supported · {words} word{words === 1 ? "" : "s"} · ~{Math.max(1, Math.round(words / 200))} min read
      </p>
    </Tabs>
  );
}

export function MarkdownField({ name, label, required, description, ...editor }: { name: string; label?: string; required?: boolean; description?: string } & Omit<EditorProps, "value" | "onChange" | "onBlur">) {
  return (
    <ChoiceShell {...{ name, label, required, description }}>
      {(value, onChange, onBlur) => <BoundEditor value={(value as string) ?? ""} onChange={onChange} onBlur={onBlur} {...editor} />}
    </ChoiceShell>
  );
}

/** Inside a FormItem: connects the label/description/error ids to the textarea. */
function BoundEditor(props: EditorProps) {
  const { formItemId, formDescriptionId, formMessageId, error } = useFormField();
  return (
    <MarkdownEditor
      {...props}
      textareaProps={{ id: formItemId, "aria-invalid": !!error, "aria-describedby": error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId }}
    />
  );
}
