export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Model {
  id: string;
  name: string;
  created?: number;
  owned_by?: string;
}

export interface ChatState {
  apiKey: string;
  availableModels: Model[];
  selectedModel: string;
  lastModelCheck: number | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  customModels: string[];
  videoEnabled: boolean;
}
