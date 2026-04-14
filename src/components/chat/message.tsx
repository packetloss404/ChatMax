import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "../../lib/utils";

interface MessageProps {
  content: string;
}

export default function Message({ content }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div className="relative group">
      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            pre({ children }) {
              const code = String(children).replace(/\n$/, "");
              return (
                <PreBlock code={code} copied={copied} onCopy={handleCopy} />
              );
            },
            code({ className, children, ...props }) {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function PreBlock({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const language = code.split("\n")[0]?.match(/^```(\w+)/)?.[1] || "code";

  return (
    <div className="relative my-3 rounded-lg overflow-hidden bg-[#0d0d14] border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-border">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={onCopy}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors",
            copied
              ? "text-green-400 hover:bg-green-400/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
        <code>{code.replace(/^```\w+\n/, "").replace(/\n```$/, "")}</code>
      </pre>
    </div>
  );
}
