/**
 * OpenAI client — sekarang khusus untuk Realtime Voice API saja.
 * Untuk chat/streaming, pakai services/ai.ts (multi-provider).
 *
 * Voice tetap OpenAI karena belum ada alternatif realtime audio WebRTC
 * yang setara di provider lain (per Mei 2026).
 */
import OpenAI from "openai";
import { env } from "../env.js";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const CHAT_MODEL = env.OPENAI_CHAT_MODEL;
export const REALTIME_MODEL = env.OPENAI_REALTIME_MODEL;
