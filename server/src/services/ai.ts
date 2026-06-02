/**
 * Multi-provider AI service untuk NusaLingua.
 *
 * Provider didukung (chat & streaming):
 *   - groq   → Llama 3.3 70B (gratis, sangat cepat)
 *   - openai → gpt-4o-mini (berbayar, kualitas tinggi)
 *
 * Voice (Realtime API) tetap pakai OpenAI — Groq belum support realtime audio.
 *
 * Switch via env: AI_PROVIDER=groq|openai (default: groq kalau GROQ_API_KEY ada)
 *
 * Semua provider OpenAI-compatible — kode SSE streaming yang sudah ada tidak
 * perlu diubah karena response shape identik (deltas, choices[].delta.content).
 */
import OpenAI from "openai";
import { env } from "../env.js";

type Provider = "groq" | "openai";

function resolveProvider(): Provider {
  if (env.AI_PROVIDER === "openai") return "openai";
  if (env.AI_PROVIDER === "groq") return "groq";
  // Auto: pilih groq kalau key tersedia (hemat biaya), fallback openai
  return env.GROQ_API_KEY ? "groq" : "openai";
}

const provider: Provider = resolveProvider();

const PROVIDER_CONFIG = {
  groq: {
    apiKey: env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
    chatModel: env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile",
  },
  openai: {
    apiKey: env.OPENAI_API_KEY || "",
    baseURL: undefined, // default api.openai.com
    chatModel: env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  },
} as const;

const cfg = PROVIDER_CONFIG[provider];

if (!cfg.apiKey) {
  throw new Error(
    `AI provider "${provider}" terpilih tapi API key kosong. ` +
      `Set ${provider === "groq" ? "GROQ_API_KEY" : "OPENAI_API_KEY"} di .env.`
  );
}

console.log(`[ai] provider=${provider} model=${cfg.chatModel}`);

/** OpenAI-compatible client (Groq pakai sama). Streaming/non-streaming sama. */
export const aiClient = new OpenAI({
  apiKey: cfg.apiKey,
  baseURL: cfg.baseURL,
});

export const CHAT_MODEL = cfg.chatModel;
export const ACTIVE_PROVIDER: Provider = provider;
