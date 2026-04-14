import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../lib/store";
import { sendMessageStream } from "../lib/api";
import { generateId } from "../lib/utils";
import Sidebar from "../components/chat/sidebar";
import MessageList from "../components/chat/message-list";
import ChatInput from "../components/chat/chat-input";

export default function Chat() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    apiKey,
    selectedModel,
    conversations,
    activeConversationId,
    addMessage,
    updateMessage,
    updateConversationTitle,
  } = useChatStore();

  useEffect(() => {
    if (!apiKey) {
      navigate("/settings");
    }
  }, [apiKey, navigate]);

  const handleSend = useCallback(
    async (message: string) => {
      if (!apiKey || !activeConversationId) return;

      const conversation = conversations.find((c) => c.id === activeConversationId);
      if (!conversation) return;

      addMessage(activeConversationId, { role: "user", content: message });

      if (conversation.messages.length === 0) {
        const title = message.slice(0, 30) + (message.length > 30 ? "..." : "");
        updateConversationTitle(activeConversationId, title);
      }

      setIsLoading(true);
      const assistantMessageId = generateId();

      const messages = [
        ...conversation.messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];

      let accumulatedContent = "";

      addMessage(activeConversationId, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      });

      await new Promise<void>((resolve) => {
        sendMessageStream(
          apiKey,
          selectedModel,
          messages,
          (chunk) => {
            accumulatedContent += chunk;
            updateMessage(activeConversationId, assistantMessageId, accumulatedContent);
          },
          () => {
            resolve();
          },
          (error) => {
            accumulatedContent += `\n\nError: ${error.message}`;
            updateMessage(activeConversationId, assistantMessageId, accumulatedContent);
            resolve();
          }
        );
      });

      setIsLoading(false);
    },
    [
      apiKey,
      selectedModel,
      activeConversationId,
      conversations,
      addMessage,
      updateMessage,
      updateConversationTitle,
    ]
  );

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MessageList isLoading={isLoading} />
        {activeConversationId && (
          <ChatInput onSend={handleSend} isLoading={isLoading} disabled={!apiKey} />
        )}
      </div>
    </div>
  );
}
