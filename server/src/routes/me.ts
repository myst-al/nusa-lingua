import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, users } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/me
 * Profil + status uji coba Pro 14 hari (dihitung dari tanggal daftar / createdAt).
 * Tanpa kolom DB tambahan: trialEndsAt = createdAt + 14 hari.
 */
meRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    const createdAt = u?.createdAt ? new Date(u.createdAt) : new Date();
    const trialEndsAt = new Date(createdAt.getTime() + TRIAL_DAYS * DAY_MS);
    const now = Date.now();
    const trialActive = now < trialEndsAt.getTime();
    const trialDaysLeft = trialActive
      ? Math.ceil((trialEndsAt.getTime() - now) / DAY_MS)
      : 0;

    res.json({
      id: req.user!.id,
      email: u?.email ?? req.user!.email,
      name: u?.name ?? "User",
      avatarUrl: u?.avatarUrl ?? null,
      createdAt: createdAt.toISOString(),
      plan: trialActive ? "pro_trial" : "free",
      trialEndsAt: trialEndsAt.toISOString(),
      trialActive,
      trialDaysLeft,
    });
  } catch (err) {
    next(err);
  }
});
