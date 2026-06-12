import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import { env } from "../env.js";
import { db, users } from "../db/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Supabase server client — pakai service_role key untuk privilege full.
 * Method `auth.getUser(token)` otomatis support kedua mode:
 *   1. Legacy: HS256 dengan shared SUPABASE_JWT_SECRET
 *   2. New:    Asymmetric JWT Signing Keys (ES256/RS256) — auto fetch JWKS
 */
const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Optional fast-path: kalau token HS256 valid, skip network call ke Supabase.
const hsSecret = env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  : null;

interface VerifiedUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
}

async function verifyToken(token: string): Promise<VerifiedUser | null> {
  // Path 1: coba HS256 cepat (no network) — kalau project pakai legacy auth
  if (hsSecret) {
    try {
      const { payload } = await jwtVerify(token, hsSecret, {
        algorithms: ["HS256"],
      });
      if (payload.sub) {
        return {
          id: payload.sub as string,
          email: (payload.email as string) ?? "",
          name:
            (payload.user_metadata as any)?.full_name ??
            (payload.email as string)?.split("@")[0] ??
            "User",
          avatarUrl: (payload.user_metadata as any)?.avatar_url ?? null,
        };
      }
    } catch {
      // HS256 gagal — lanjut ke path 2 (SDK call)
    }
  }

  // Path 2: pakai Supabase SDK — handle asymmetric keys & introspection
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    const u = data.user;
    return {
      id: u.id,
      email: u.email ?? "",
      name:
        (u.user_metadata?.full_name as string | undefined) ??
        u.email?.split("@")[0] ??
        "User",
      avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? null,
    };
  } catch (err) {
    console.error("[auth] supabase.getUser error:", err);
    return null;
  }
}

/**
 * Middleware: require valid Supabase JWT.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = header.slice("Bearer ".length);
  const verified = await verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Upsert user (first-time login akan dibuat record-nya).
  // Di-cache in-memory supaya tidak menulis ke DB di SETIAP request.
  if (!seenUsers.has(verified.id)) {
    await db
      .insert(users)
      .values({
        id: verified.id,
        email: verified.email,
        name: verified.name ?? "User",
        avatarUrl: verified.avatarUrl ?? null,
      })
      .onConflictDoNothing();
    if (seenUsers.size >= SEEN_USERS_MAX) seenUsers.clear();
    seenUsers.add(verified.id);
  }

  req.user = { id: verified.id, email: verified.email };
  next();
}

// Cache user-id yang sudah pernah di-upsert (reset saat restart / penuh).
const SEEN_USERS_MAX = 10_000;
const seenUsers = new Set<string>();

/**
 * Optional auth — kalau ada Authorization header, di-verify; kalau tidak,
 * request diteruskan dengan req.user undefined.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  const token = header.slice("Bearer ".length);
  const verified = await verifyToken(token);
  if (verified) {
    req.user = { id: verified.id, email: verified.email };
  }
  next();
}
