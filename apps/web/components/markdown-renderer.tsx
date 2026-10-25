"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content?: string | null;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <p className="text-muted-foreground italic text-sm">No description provided.</p>;
  }

  return (
    <div className={`markdown-content text-foreground leading-relaxed text-sm ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-heading font-black text-2xl text-foreground mt-6 mb-3 pb-1 border-b-2 border-border flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-heading font-bold text-xl text-foreground mt-5 mb-2.5 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading font-bold text-base text-foreground mt-4 mb-2 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-heading font-semibold text-sm text-foreground mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground font-heading">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-3 text-muted-foreground pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-3 text-muted-foreground pl-2 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-1.5 italic my-3 bg-muted/40 brutal-border border-y-0 border-r-0 text-foreground text-xs leading-relaxed">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-primary font-bold border border-border" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-card p-3 brutal-border overflow-x-auto my-3 text-xs font-mono text-foreground" {...props}>
                {children}
              </code>
            );
          },
          hr: () => <hr className="border-border my-5" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
