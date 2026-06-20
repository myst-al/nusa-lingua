/**
 * Multi-provider AI service untuk NusaLingua.
 *
 * Provider didukung (chat & streaming, semua OpenAI-compatible):
 *   - sealion -> SEA-LION / Sahabat-AI (model AI kawasan Indonesia/ASEAN) [DEFAULT]
 *   - groq    -> Llama 3.3 70B (gratis, sangat cepat) [fallback]
 *   - openai  -> gpt-4o-mini (berbayar, kualitas tinggi)
 *
 * Voice (Realtime API) tetap pakai OpenAI - provider lain belum support realtime audio.
 *
 * Switch via env: AI_PROVIDER=sealion|groq|openai
 * (default: sealion kalau SEA_LION_API_KEY ada, lalu groq, lalu openai)
 *
 * Semua provider OpenAI-compatible - kode SSE streaming yang sudah ada tidak perlu
 * diubah karena response shape identik (deltas, choices[].delta.content).
 */
import OpenAI from "openai";
import { env } from "../env.js";

type Provider = "sealion" | "groq" | "openai";

function resolveProvider(): Provider {
  if (env.AI_PROVIDER) return env.AI_PROVIDER;
  if (env.SEA_LION_API_KEY) return "sealion"; // utamakan AI Indonesia
  if (env.GROQ_API_KEY) return "groq";
  return "openai";
}

const provider: Provider = resolveProvider();

const PROVIDER_CONFIG = {
  sealion: {
    apiKey: env.SEA_LION_API_KEY || "",
    baseURL: env.SEA_LION_BASE_URL as string | undefined,
    chatModel: env.SEA_LION_CHAT_MODEL,
    envKey: "SEA_LION_API_KEY",
  },
  groq: {
    apiKey: env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1" as string | undefined,
    chatModel: env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
  },
  openai: {
    apiKey: env.OPENAI_API_KEY || "",
    baseURL: undefined as string | undefined, // default api.openai.com
    chatModel: env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
  },
};

const cfg = PROVIDER_CONFIG[provider];

if (!cfg.apiKey) {
  throw new Error(
    `AI provider "${provider}" terpilih tapi API key kosong. Set ${cfg.envKey} di .env.`
  );
}

console.log(`[ai] provider=${provider} model=${cfg.chatModel}`);

/** OpenAI-compatible client (SEA-LION/Groq/OpenAI sama). Streaming/non-streaming sama. */
export const aiClient = new OpenAI({
  apiKey: cfg.apiKey,
  baseURL: cfg.baseURL,
});

export const CHAT_MODEL = cfg.chatModel;
export const ACTIVE_PROVIDER: Provider = provider;
