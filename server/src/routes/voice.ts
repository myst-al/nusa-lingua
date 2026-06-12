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
 * Generate ephemeral token untuk OpenAI Realtime API.
 * Client (browser) menggunakan token ini untuk konek WebRTC
 * langsung ke OpenAI Realtime — server tidak perlu proxy audio.
 *
 * Docs: https://platform.openai.com/docs/guides/realtime-webrtc
 */
voiceRouter.post("/voice/session", requireAuth, async (req, res, next) => {
  try {
    const body = sessionSchema.parse(req.body ?? {});

    // Load language prompt
    const [lang] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, body.languageCode))
      .limit(1);

    const instructions = lang?.systemPrompt
      ? `${lang.systemPrompt}\n\nKamu berinteraksi via SUARA. Bicara natural, jelas, dan tidak terlalu panjang per giliran.`
      : "Anda asisten suara NusaLingua. Bicara natural dalam Bahasa Indonesia.";

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_REALTIME_MODEL,
        voice: body.voice,
        instructions,
        modalities: ["audio", "text"],
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Failed to create realtime session",
        details: errorText,
      });
    }

    const session = await response.json();
    // client_secret.value = ephemeral token (valid 60 detik)
    res.json(session);
  } catch (err) {
    next(err);
  }
});
