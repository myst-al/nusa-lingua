import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, languages } from "../db/index.js";
import { aiClient, CHAT_MODEL } from "../services/ai.js";
import { requireAuth } from "../middleware/auth.js";

export const translateRouter = Router();

const translateSchema = z.object({
  text: z.string().min(1).max(4000),
  sourceCode: z.string().max(16).optional(), // kosong = auto-detect
  targetCode: z.string().min(2).max(16),
});

/**
 * POST /api/translate
 * Terjemahkan teks ke Bahasa Indonesia / bahasa daerah memakai model AI Indonesia.
 * Response: { translation, sourceName, targetName }
 */
translateRouter.post("/translate", requireAuth, async (req, res, next) => {
  try {
    const body = translateSchema.parse(req.body);

    const [target] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, body.targetCode))
      .limit(1);
    if (!target) {
      return res.status(400).json({ error: "Bahasa tujuan tidak dikenal" });
    }

    let sourceName = "bahasa sumber (deteksi otomatis)";
    if (body.sourceCode) {
      const [source] = await db
        .select()
        .from(languages)
        .where(eq(languages.code, body.sourceCode))
        .limit(1);
      if (source) sourceName = source.name;
    }

    const system =
      `Anda penerjemah ahli bahasa Nusantara. Terjemahkan teks pengguna ` +
      `dari ${sourceName} ke ${target.name} (${target.region}). ` +
      `Pertahankan makna, nuansa, dan kesopanan yang wajar. ` +
      `Jika ${target.name} memiliki tingkat tutur, gunakan ragam yang sopan dan umum. ` +
      `Keluarkan HANYA hasil terjemahan: tanpa penjelasan, tanpa tanda kutip, tanpa catatan tambahan.`;

    const completion = await aiClient.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: body.text },
      ],
    });

    const translation = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ translation, sourceName, targetName: target.name });
  } catch (err) {
    next(err);
  }
});
