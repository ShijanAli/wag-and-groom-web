"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getErrorMessage } from "@/lib/api/errors";
import { cdn } from "@/lib/image";
import { cn } from "@/lib/utils";
import { uploadsApi, validateImage, type UploadFolder } from "@/features/uploads/api";

const MAX_PER_REQUEST = 10;

/** Uploads several images at once (POST /uploads/images) and returns their URLs. */
export function useMultiUpload(folder: UploadFolder) {
  const [uploading, setUploading] = useState(false);
  const upload = async (files: File[]): Promise<string[]> => {
    const ok = files.filter((f) => {
      const err = validateImage(f);
      if (err) toast.error(`${f.name}: ${err}`);
      return !err;
    });
    if (!ok.length) return [];
    setUploading(true);
    try {
      const batches = Array.from({ length: Math.ceil(ok.length / MAX_PER_REQUEST) }, (_, i) => ok.slice(i * MAX_PER_REQUEST, (i + 1) * MAX_PER_REQUEST));
      const results = await Promise.all(batches.map((b) => uploadsApi.images(b, folder)));
      return results.flat().map((r) => r.url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
      return [];
    } finally {
      setUploading(false);
    }
  };
  return { upload, uploading };
}

/** Drop zone / button that hands picked files to `onFiles`. */
export function ImageDropZone({ onFiles, busy, max, className }: { onFiles: (files: File[]) => void; busy?: boolean; max?: number; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files).slice(0, max));
      }}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-muted-foreground transition-colors disabled:opacity-60",
        over ? "border-primary bg-primary/5" : "hover:border-primary/60",
        className,
      )}
    >
      {busy ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="h-6 w-6" />}
      <span className="text-xs font-medium">{busy ? "Uploading…" : "Add photos"}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []).slice(0, max));
          e.target.value = "";
        }}
      />
    </button>
  );
}

/**
 * Form-bound gallery: value is `string[]` of image URLs, the first one is the cover.
 * Click ★ to make a photo the cover.
 */
export function MultiImageUploadField({ name, label, description, folder, max = 10 }: { name: string; label?: string; description?: string; folder: UploadFolder; max?: number }) {
  const { control } = useFormContext();
  const { upload, uploading } = useMultiUpload(folder);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const urls: string[] = field.value ?? [];
        const set = (next: string[]) => field.onChange(next.slice(0, max));
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {urls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded image preview */}
                    <img src={cdn(url, 240, 240)} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">COVER</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {i > 0 && (
                        <button type="button" onClick={() => set([url, ...urls.filter((u) => u !== url)])} className="rounded bg-white/90 p-1" aria-label="Make cover">
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button type="button" onClick={() => set(urls.filter((u) => u !== url))} className="rounded bg-white/90 p-1 text-destructive" aria-label="Remove photo">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {urls.length < max && <ImageDropZone busy={uploading} max={max - urls.length} onFiles={async (files) => set([...urls, ...(await upload(files))])} />}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
