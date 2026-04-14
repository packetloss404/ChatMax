import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState, Conversation, Message, Model } from "./types";
import { generateId } from "./utils";

const DEFAULT_MODEL = "MiniMax-M2.7-highspeed";

interface ChatActions {
  setApiKey: (key: string) => void;
  setAvailableModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
  setLastModelCheck: (time: number) => void;
  addConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt"> & { id?: string }) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  clearAllData: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSidebarOpen: (open: boolean) => void;
  setCustomModels: (models: string[]) => void;
  setVideoEnabled: (enabled: boolean) => void;
}

const initialState = {
  apiKey: "",
  availableModels: [] as Model[],
  selectedModel: DEFAULT_MODEL,
  lastModelCheck: null as number | null,
  conversations: [] as Conversation[],
  activeConversationId: null as string | null,
  theme: "system" as const,
  sidebarOpen: true,
  customModels: [] as string[],
  videoEnabled: false,
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
  (set) => ({
    ...initialState,

    setApiKey: (key) => set({ apiKey: key }),

    setAvailableModels: (models) => set({ availableModels: models }),

    setSelectedModel: (model) => set({ selectedModel: model }),

    setLastModelCheck: (time) => set({ lastModelCheck: time }),

    addConversation: () => {
      const id = generateId();
      const conversation: Conversation = {
        id,
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversationId: id,
      }));
      return id;
    },

    deleteConversation: (id) => {
      set((state) => {
        const conversations = state.conversations.filter((c) => c.id !== id);
        const activeConversationId =
          state.activeConversationId === id
            ? conversations[0]?.id || null
            : state.activeConversationId;
        return { conversations, activeConversationId };
      });
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    updateConversationTitle: (id, title) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title, updatedAt: Date.now() } : c
        ),
      }));
    },

    addMessage: (conversationId, message) => {
      const newMessage: Message = {
        role: message.role,
        content: message.content,
        id: message.id || generateId(),
        createdAt: Date.now(),
      };
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, newMessage], updatedAt: Date.now() }
            : c
        ),
      }));
    },

    updateMessage: (conversationId, messageId, content) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, content } : m
                ),
                updatedAt: Date.now(),
              }
            : c
        ),
      }));
    },

    clearAllData: () => set(initialState),

    setCustomModels: (models) => set({ customModels: models }),

    setTheme: (theme) => set({ theme }),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setVideoEnabled: (enabled) => set({ videoEnabled: enabled }),
  }),
  {
    name: "chatmax-storage",
    partialize: (state) => ({
      apiKey: state.apiKey,
      selectedModel: state.selectedModel,
      availableModels: state.availableModels,
      lastModelCheck: state.lastModelCheck,
      customModels: state.customModels,
      conversations: state.conversations,
      theme: state.theme,
      videoEnabled: state.videoEnabled,
    }),
  })
);
