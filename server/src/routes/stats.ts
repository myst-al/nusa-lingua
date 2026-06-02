import { Router } from "express";
import { sql } from "drizzle-orm";
import { db, languages, conversations, messages, users } from "../db/index.js";

export const statsRouter = Router();

/**
 * GET /api/stats
 * Stats publik untuk Landing page — tidak butuh auth.
 * Cached 60 detik agar tidak hit DB tiap visitor.
 */
let cache: { data: Stats; expiresAt: number } | null = null;
const TTL_MS = 60_000;

interface Stats {
  languages: number;
  conversations: number;
  messages: number;
  users: number;
  updatedAt: string;
}

statsRouter.get("/stats", async (_req, res, next) => {
  try {
    const now = Date.now();
    if (cache && cache.expiresAt > now) {
      return res.json(cache.data);
    }

    // Hitung paralel
    const [langCnt, convoCnt, msgCnt, userCnt] = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(languages),
      db.select({ c: sql<number>`count(*)::int` }).from(conversations),
      db.select({ c: sql<number>`count(*)::int` }).from(messages),
      db.select({ c: sql<number>`count(*)::int` }).from(users),
    ]);

    const data: Stats = {
      languages: langCnt[0]?.c ?? 0,
      conversations: convoCnt[0]?.c ?? 0,
      messages: msgCnt[0]?.c ?? 0,
      users: userCnt[0]?.c ?? 0,
      updatedAt: new Date().toISOString(),
    };

    cache = { data, expiresAt: now + TTL_MS };
    res.json(data);
  } catch (err) {
    next(err);
  }
});
