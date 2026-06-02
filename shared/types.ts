// Shared types antara client & server

export interface Language {
  code: string;
  name: string;
  region: string;
  speakers: number;
  status: "live" | "beta" | "soon";
  flag: string;
  systemPrompt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  languageCode: string;
  botId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface CreateConversationInput {
  title?: string;
  languageCode: string;
  botId?: string;
}

export interface SendMessageInput {
  content: string;
}

// ============================================
// BOTS (NusaLingua Studio)
// ============================================

export type BotNode =
  | { id: string; type: "trigger"; channel: "web" | "whatsapp" | "telegram" }
  | { id: string; type: "system_prompt"; content: string }
  | { id: string; type: "llm_call"; model: string; temperature: number }
  | { id: string; type: "condition"; expression: string }
  | { id: string; type: "send_reply" }
  | { id: string; type: "end" };

export interface BotFlow {
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  welcomeMessage?: string;
  tags?: string[];
  nodes: BotNode[];
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  languageCode: string;
  status: "draft" | "published" | "archived";
  flow: BotFlow;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// SSE stream events
export type StreamEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string; tokensUsed?: number }
  | { type: "error"; error: string };

// ===== Stats =====
export interface Stats {
  languages: number;
  conversations: number;
  messages: number;
  users: number;
  updatedAt: string;
}
