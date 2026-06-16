import { Router } from "express";
import { z } from "zod";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";
import { db, languages } from "../db/index.js";
import { eq } from "drizzle-orm";

export const voiceRouter = Router();

const sessionSchema = z.object({
  languageCode: z.string().min(2).max(16).default("id"),
  // Hanya voice yang didukung OpenAI Realtime API (fable/onyx/nova = TTS-only, ditolak Realtime)
  voice: z
    .enum(["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"])
    .default("alloy"),
});

/**
 * POST /api/voice/session
 *
 * Generate ephemeral token untuk OpenAI Realtime API (GA).
 * Client (browser) memakai token ini untuk konek WebRTC langsung ke
 * OpenAI Realtime - server tidak perlu proxy audio.
 *
 * Docs: https://platform.openai.com/docs/guides/realtime-webrtc
 */
voiceRouter.post("/voice/session", requireAuth, async (req, res, next) => {
  try {
    const body = sessionSchema.parse(req.body ?? {});

    const [lang] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, body.languageCode))
      .limit(1);

    const instructions = lang?.systemPrompt
      ? `${lang.systemPrompt}\n\nKamu berinteraksi via SUARA. Bicara natural, jelas, tidak terlalu panjang per giliran.`
      : "Anda asisten suara NusaLingua. Bicara natural dalam Bahasa Indonesia.";

    const model = env.OPENAI_REALTIME_MODEL;

    // GA Realtime API: ephemeral token via /v1/realtime/client_secrets.
    // (Endpoint lama /v1/realtime/sessions sudah tidak berlaku -> "Invalid URL".)
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model,
            instructions,
            audio: {
              input: {
                transcription: { model: "whisper-1" },
                turn_detection: { type: "server_vad" },
              },
              output: { voice: body.voice },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Failed to create realtime session",
        details: errorText,
      });
    }

    // GA response: { value: "ek_...", expires_at, session }. Fallback ke shape lama.
    const data = (await response.json()) as {
      value?: string;
      client_secret?: { value?: string };
      expires_at?: number;
    };
    const value = data.value ?? data.client_secret?.value;
    res.json({ value, model, expires_at: data.expires_at });
  } catch (err) {
    next(err);
  }
});
