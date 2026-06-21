import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, users } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

interface TrialStatus {
  plan: "pro_trial" | "free";
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialActive: boolean;
  trialDaysLeft: number;
  trialUsed: boolean;
}

function trialStatusOf(raw: Date | string | null): TrialStatus {
  const started = raw ? new Date(raw) : null;
  const ends = started ? new Date(started.getTime() + TRIAL_DAYS * DAY_MS) : null;
  const now = Date.now();
  const active = !!(ends && now < ends.getTime());
  return {
    plan: active ? "pro_trial" : "free",
    trialStartedAt: started ? started.toISOString() : null,
    trialEndsAt: ends ? ends.toISOString() : null,
    trialActive: active,
    trialDaysLeft: active && ends ? Math.ceil((ends.getTime() - now) / DAY_MS) : 0,
    trialUsed: !!started,
  };
}

/** GET /api/me — profil + status uji coba Pro. */
meRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);
    res.json({
      id: req.user!.id,
      email: u?.email ?? req.user!.email,
      name: u?.name ?? "User",
      avatarUrl: u?.avatarUrl ?? null,
      ...trialStatusOf(u?.trialStartedAt ?? null),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/trial/start — aktifkan uji coba Pro 14 hari (opt-in dari halaman Pricing).
 * Idempotent: kalau sudah pernah diaktifkan, tanggal mulai dipertahankan (tidak reset).
 */
meRouter.post("/trial/start", requireAuth, async (req, res, next) => {
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);
    if (!u) return res.status(404).json({ error: "User tidak ditemukan" });

    let started: Date | string | null = u.trialStartedAt;
    if (!started) {
      started = new Date();
      await db
        .update(users)
        .set({ trialStartedAt: started })
        .where(eq(users.id, req.user!.id));
    }
    res.json(trialStatusOf(started));
  } catch (err) {
    next(err);
  }
});
