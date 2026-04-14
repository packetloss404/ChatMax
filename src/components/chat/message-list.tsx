import { useRef, useEffect } from "react";
import { useChatStore } from "../../lib/store";
import { cn } from "../../lib/utils";
import { Bot, User, Loader2, Plus } from "lucide-react";
import Message from "./message";

interface MessageListProps {
  isLoading?: boolean;
}

export default function MessageList({ isLoading }: MessageListProps) {
  const { conversations, activeConversationId, addConversation } = useChatStore();
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Welcome to ChatMax</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Start a new chat or select an existing conversation from the sidebar
          </p>
          <button
            onClick={() => addConversation()}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Send a message to begin chatting with MiniMax M2.7
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={cn(
                "flex-1 max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.role === "assistant" && !msg.content ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              ) : (
                <Message content={msg.content} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
