import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders blog/CMS Markdown. Raw HTML is NOT rendered (react-markdown's default), so
 * content can never inject scripts. External links open in a new tab.
 */
export const Markdown = memo(function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-primary prose-img:rounded-2xl prose-blockquote:border-primary prose-blockquote:font-normal prose-blockquote:not-italic",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children, ...props }) => {
            const external = /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...props}>
                {children}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
