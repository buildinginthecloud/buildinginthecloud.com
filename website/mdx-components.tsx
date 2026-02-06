import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom heading components with anchor links
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-3xl font-semibold mt-8 mb-4 scroll-mt-20" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold mt-4 mb-2 scroll-mt-20" {...props}>
        {children}
      </h4>
    ),
    // Custom paragraph
    p: ({ children, ...props }) => (
      <p className="my-4 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    // Custom links - external links open in new tab
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            {...props}
          >
            {children}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        );
      }
      return (
        <Link href={href || ""} className="text-primary hover:underline" {...props}>
          {children}
        </Link>
      );
    },
    // Custom image with Next.js Image
    img: ({ src, alt, ...props }) => (
      <figure className="my-6">
        <Image
          src={src || ""}
          alt={alt || ""}
          width={800}
          height={400}
          className="rounded-lg"
          {...props}
        />
        {alt && (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    // Custom code blocks
    pre: ({ children, ...props }) => (
      <pre
        className="overflow-x-auto rounded-lg p-4 my-4 bg-muted text-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ children, ...props }) => (
      <code
        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    ),
    // Custom blockquote
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Custom lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside my-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside my-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    // Custom table
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border border-border rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="bg-muted px-4 py-2 text-left font-semibold border-b border-border"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 border-b border-border" {...props}>
        {children}
      </td>
    ),
    // Custom horizontal rule
    hr: (props) => <hr className="my-8 border-border" {...props} />,
    ...components,
  };
}
