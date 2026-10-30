/**
 * Cloudinary delivers resized, modern-format images straight from the URL:
 *   …/upload/v123/pets/a.jpg → …/upload/f_auto,q_auto,c_fill,w_600,h_450/v123/pets/a.jpg
 * Other URLs are returned untouched. Use with a plain <img loading="lazy"> for API images.
 */
export function cdn(url: string | null | undefined, width: number, height?: number): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const t = ["f_auto", "q_auto", "c_fill", `w_${width}`, height && `h_${height}`].filter(Boolean).join(",");
  return url.replace("/upload/", `/upload/${t}/`);
}
