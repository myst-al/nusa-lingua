import { Router } from "express";
import { db, languages } from "../db/index.js";
import { eq } from "drizzle-orm";

export const languagesRouter = Router();

/**
 * GET /api/languages
 * List semua bahasa yang didukung NusaLingua.
 */
languagesRouter.get("/languages", async (_req, res, next) => {
  try {
    const rows = await db.select().from(languages);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/languages/:code
 * Detail satu bahasa.
 */
languagesRouter.get("/languages/:code", async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, req.params.code))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Language not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});
