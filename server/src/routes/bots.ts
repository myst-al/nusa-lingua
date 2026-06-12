import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, and, desc } from "drizzle-orm";
import { db, bots, languages } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const botsRouter = Router();

const botNodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "trigger",
    "system_prompt",
    "llm_call",
    "condition",
    "send_reply",
    "end",
  ]),
  channel: z.string().optional(),
  content: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  expression: z.string().optional(),
});

const botFlowSchema = z.object({
  systemPrompt: z.string().min(10).max(8000),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  welcomeMessage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  nodes: z.array(botNodeSchema).default([]),
});

const createBotSchema = z.object({
  name: z.string().min(1).max(120),
  // nullish: client boleh kirim null (mis. mengosongkan deskripsi saat update)
  description: z.string().max(2000).nullish(),
  languageCode: z.string().min(2).max(16),
  flow: botFlowSchema,
  status: z.enum(["draft", "published", "archived"]).optional(),
  isPublic: z.boolean().optional(),
});

const updateBotSchema = createBotSchema.partial();

/**
 * GET /api/bots
 */
botsRouter.get("/bots", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(bots)
      .where(eq(bots.userId, req.user!.id))
      .orderBy(desc(bots.updatedAt));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bots
 */
botsRouter.post("/bots", requireAuth, async (req, res, next) => {
  try {
    const body = createBotSchema.parse(req.body);

    // Validate language
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
      .insert(bots)
      .values({
        id,
        userId: req.user!.id,
        name: body.name,
        description: body.description ?? null,
        languageCode: body.languageCode,
        status: body.status ?? "draft",
        flow: body.flow,
        isPublic: body.isPublic ?? false,
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
 * GET /api/bots/:id
 */
botsRouter.get("/bots/:id", requireAuth, async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(bots)
      .where(and(eq(bots.id, req.params.id), eq(bots.userId, req.user!.id)))
      .limit(1);
    if (!row) return res.status(404).json({ error: "Bot not found" });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/bots/:id
 */
botsRouter.patch("/bots/:id", requireAuth, async (req, res, next) => {
  try {
    const body = updateBotSchema.parse(req.body);

    // Validate languageCode kalau diubah — hindari FK error 500
    if (body.languageCode) {
      const [lang] = await db
        .select({ code: languages.code })
        .from(languages)
        .where(eq(languages.code, body.languageCode))
        .limit(1);
      if (!lang) {
        return res.status(400).json({ error: "Bahasa tidak ditemukan" });
      }
    }

    const [updated] = await db
      .update(bots)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(eq(bots.id, req.params.id), eq(bots.userId, req.user!.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Bot not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/bots/:id
 */
botsRouter.delete("/bots/:id", requireAuth, async (req, res, next) => {
  try {
    await db
      .delete(bots)
      .where(and(eq(bots.id, req.params.id), eq(bots.userId, req.user!.id)));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
