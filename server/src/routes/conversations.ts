import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db, conversations, messages, languages } from "../db/index.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

export const conversationsRouter = Router();

const createConvoSchema = z.object({
  title: z.string().optional(),
  languageCode: z.string().min(2).max(16),
  botId: z.string().optional(),
});

/**
 * GET /api/conversations
 * List percakapan milik user yang login.
 */
conversationsRouter.get("/conversations", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, req.user!.id))
      .orderBy(desc(conversations.updatedAt));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/conversations
 * Buat percakapan baru.
 */
conversationsRouter.post("/conversations", requireAuth, async (req, res, next) => {
  try {
    const body = createConvoSchema.parse(req.body);

    // Validate language exists
    const [lang] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, body.languageCode))
      .limit(1);
    if (!lang) {
      return res.status(400).json({ error: "Bahasa tidak ditemukan" });
    }

    const id = nanoid();
    const now = new Date();
    const [created] = await db
      .insert(conversations)
      .values({
        id,
        userId: req.user!.id,
        title: body.title ?? `Percakapan ${lang.name}`,
        languageCode: body.languageCode,
        botId: body.botId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/conversations/:id
 */
conversationsRouter.get("/conversations/:id", requireAuth, async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, req.params.id),
          eq(conversations.userId, req.user!.id)
        )
      )
      .limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/conversations/:id/messages
 */
conversationsRouter.get(
  "/conversations/:id/messages",
  requireAuth,
  async (req, res, next) => {
    try {
      // Verifikasi ownership conversation dulu
      const [convo] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, req.params.id),
            eq(conversations.userId, req.user!.id)
          )
        )
        .limit(1);
      if (!convo) return res.status(404).json({ error: "Not found" });

      const rows = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, req.params.id))
        .orderBy(messages.createdAt);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/conversations/:id
 */
conversationsRouter.delete(
  "/conversations/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      await db
        .delete(conversations)
        .where(
          and(
            eq(conversations.id, req.params.id),
            eq(conversations.userId, req.user!.id)
          )
        );
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);
