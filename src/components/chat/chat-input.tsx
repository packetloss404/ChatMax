import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  const handleSubmit = useCallback(() => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [message, isLoading, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-card px-3 py-3 md:p-4 pb-safe">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 md:gap-3 bg-muted rounded-2xl px-3 md:px-4 py-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent resize-none outline-none min-h-[24px] max-h-[200px] text-sm md:text-base"
            rows={1}
            disabled={disabled || isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            className={cn(
              "p-2.5 md:p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center",
              message.trim() && !isLoading && !disabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 hidden md:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
