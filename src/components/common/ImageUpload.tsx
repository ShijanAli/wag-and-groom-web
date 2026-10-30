"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { uploadsApi, validateImage, type UploadFolder } from "@/features/uploads/api";

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  /** "square" for avatars/thumbnails, "wide" for covers/banners. */
  aspect?: "square" | "wide";
  className?: string;
  disabled?: boolean;
}

/** Click or drop an image → uploads to Cloudinary via the API → returns the URL. */
export function ImageUpload({ value, onChange, folder, aspect = "wide", className, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    const invalid = validateImage(file);
    if (invalid) return void toast.error(invalid);
    setUploading(true);
    try {
      const img = await uploadsApi.image(file, folder);
      onChange(img.url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const busy = uploading || disabled;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition-colors",
        aspect === "square" ? "aspect-square w-32" : "aspect-[16/9] w-full",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!busy) handleFile(e.dataTransfer.files[0]);
      }}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, sized by container
        <img src={value} alt="" className="h-full w-full object-cover" />
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs font-medium">{aspect === "square" ? "Upload" : "Click or drop an image"}</span>
        </button>
      )}

      {value && !busy && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground">
            Change
          </button>
          <button type="button" onClick={() => onChange(null)} aria-label="Remove image" className="rounded-md bg-white/90 p-1 text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

/** Form-bound version: value is the image URL (string | null). */
export function ImageUploadField({
  name,
  label,
  description,
  ...props
}: Omit<ImageUploadProps, "value" | "onChange"> & { name: string; label?: React.ReactNode; description?: React.ReactNode }) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <ImageUpload {...props} value={field.value} onChange={field.onChange} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
