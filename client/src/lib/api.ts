// API client untuk berkomunikasi dengan server NusaLingua.
// Semua request authenticated routes harus include Authorization header.

import type {
  Language,
  Conversation,
  Message,
  Bot,
  BotFlow,
  StreamEvent,
  Stats,
} from "@shared/types";
import { getAccessToken } from "./supabase";

const BASE = "/api";

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} ${res.status}: ${body}`);
  }
  // Untuk 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // STATS (public — untuk Landing page)
  getStats: () => jsonFetch<Stats>("/stats"),

  // LANGUAGES (public)
  listLanguages: () => jsonFetch<Language[]>("/languages"),
  getLanguage: (code: string) => jsonFetch<Language>(`/languages/${code}`),

  // CONVERSATIONS (auth)
  listConversations: () => jsonFetch<Conversation[]>("/conversations"),
  getConversation: (id: string) => jsonFetch<Conversation>(`/conversations/${id}`),
  createConversation: (input: {
    title?: string;
    languageCode: string;
    botId?: string;
  }) =>
    jsonFetch<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deleteConversation: (id: string) =>
    jsonFetch<void>(`/conversations/${id}`, { method: "DELETE" }),
  listMessages: (conversationId: string) =>
    jsonFetch<Message[]>(`/conversations/${conversationId}/messages`),

  // BOTS (auth)
  listBots: () => jsonFetch<Bot[]>("/bots"),
  getBot: (id: string) => jsonFetch<Bot>(`/bots/${id}`),
  createBot: (input: {
    name: string;
    description?: string;
    languageCode: string;
    flow: BotFlow;
    status?: "draft" | "published" | "archived";
  }) =>
    jsonFetch<Bot>("/bots", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateBot: (id: string, patch: Partial<Omit<Bot, "id" | "userId" | "createdAt">>) =>
    jsonFetch<Bot>(`/bots/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteBot: (id: string) =>
    jsonFetch<void>(`/bots/${id}`, { method: "DELETE" }),

  // VOICE (auth)
  createVoiceSession: (languageCode: string, voice?: string) =>
    jsonFetch<{
      value: string;
      model: string;
      expires_at?: number;
    }>("/voice/session", {
      method: "POST",
      body: JSON.stringify({ languageCode, voice }),
    }),
};

/**
 * Stream chat completion via SSE.
 */
export async function streamChat(
  conversationId: string,
  content: string,
  callbacks: {
    onDelta: (text: string) => void;
    onDone: (messageId: string) => void;
    onError: (err: string) => void;
  }
): Promise<void> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    callbacks.onError(`HTTP ${res.status}: ${text}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let eventName = "message";
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) eventName = line.slice(7).trim();
        if (line.startsWith("data: ")) dataStr += line.slice(6);
      }
      if (!dataStr) continue;

      try {
        const data = JSON.parse(dataStr);
        if (eventName === "delta" && data.content) callbacks.onDelta(data.content);
        else if (eventName === "done" && data.messageId) callbacks.onDone(data.messageId);
        else if (eventName === "error" && data.error) callbacks.onError(data.error);
      } catch {
        // skip malformed
      }
    }
  }
}

export type { Language, Conversation, Message, Bot, BotFlow, StreamEvent };
