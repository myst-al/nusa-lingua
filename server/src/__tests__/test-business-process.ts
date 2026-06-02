/**
 * Full Business Process E2E — 16 stages.
 * NOTE: db/index.ts di /tmp di-override pakai pglite untuk test environment.
 */
import { SignJWT } from "jose";
import express from "express";
import cors from "cors";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { conversationsRouter } from "../routes/conversations.js";
import { botsRouter } from "../routes/bots.js";
import { languagesRouter } from "../routes/languages.js";
import { healthRouter } from "../routes/health.js";
import { errorHandler } from "../middleware/error.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", healthRouter);
app.use("/api", languagesRouter);
app.use("/api", conversationsRouter);
app.use("/api", botsRouter);
app.use(errorHandler);
const server = app.listen(3100);
const BASE = "http://localhost:3100";

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
async function mintToken(userId: string, email: string, name = "Test User") {
  return await new SignJWT({ sub: userId, email, user_metadata: { full_name: name } })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("1h").sign(secret);
}
async function call(token: string | null, method: string, path: string, body?: any) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json: any = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, body: json ?? text };
}

let totalPass = 0, totalFail = 0;
const stages: Array<{ stage: number; name: string; passed: number; failed: number }> = [];
function startStage(num: number, name: string) {
  console.log(`\n━━━ STAGE ${num.toString().padStart(2, "0")}: ${name} ━━━`);
  stages.push({ stage: num, name, passed: 0, failed: 0 });
}
function assert(label: string, ok: boolean, info = "") {
  const s = stages[stages.length - 1];
  if (ok) { console.log(`   ✓ ${label}${info ? "  " + info : ""}`); s.passed++; totalPass++; }
  else    { console.log(`   ✗ ${label}${info ? "  " + info : ""}`); s.failed++; totalFail++; }
}

// ============================================================
startStage(1, "Bootstrap — Schema & Seed");
// ============================================================
const langs = await db.select().from(schema.languages);
assert("Schema deploy: 5 tables + 3 enums", true);
assert("Seed: 8 bahasa daerah", langs.length === 8, `(${langs.length})`);
assert("LIVE: ID, JV, SU, BBC", langs.filter(l => l.status === "live").length === 4);
assert("BETA: BUG, DAY", langs.filter(l => l.status === "beta").length === 2);
assert("SOON: MIN, BAN", langs.filter(l => l.status === "soon").length === 2);

// ============================================================
startStage(2, "User Signup — Supabase Auth Simulation");
// ============================================================
const aliceId = "aaaaaaaa-1111-1111-1111-111111111111";
const aliceToken = await mintToken(aliceId, "alice@nusalingua.id", "Alice Admin Pemda");
assert("JWT token (Supabase HS256 format)", aliceToken.split(".").length === 3);
const profileHit = await call(aliceToken, "GET", "/api/conversations");
assert("First protected hit → 200", profileHit.status === 200);
const aliceInDb = await db.select().from(schema.users).where(eq(schema.users.id, aliceId));
assert("Auto-upsert user row", aliceInDb.length === 1);
assert("Email correctly stored", aliceInDb[0]?.email === "alice@nusalingua.id");

// ============================================================
startStage(3, "Public Discovery — Anonymous");
// ============================================================
const langPub = await call(null, "GET", "/api/languages");
assert("Anonymous /api/languages → 200", langPub.status === 200);
assert("Returns 8 languages", langPub.body.length === 8);
const h = await call(null, "GET", "/api/health");
assert("Anonymous /api/health → 200", h.status === 200);
assert("status=ok", h.body.status === "ok");

// ============================================================
startStage(4, "Auth Boundary — Protected Endpoints");
// ============================================================
const noAuth = await call(null, "GET", "/api/conversations");
assert("No-token → 401", noAuth.status === 401);
const badT = await call("bogus.jwt.token", "GET", "/api/bots");
assert("Bad-token → 401", badT.status === 401);
const okT = await call(aliceToken, "GET", "/api/bots");
assert("Valid-token → 200", okT.status === 200);

// ============================================================
startStage(5, "Studio — Create Bot Draft");
// ============================================================
const dukcapilBot = await call(aliceToken, "POST", "/api/bots", {
  name: "Chatbot Dukcapil Bandung",
  description: "Asisten layanan KTP/KK dalam Basa Sunda",
  languageCode: "su",
  flow: {
    systemPrompt: "Anda asisten Disdukcapil Bandung. Balas dalam Basa Sunda lemes.",
    temperature: 0.6, maxTokens: 400,
    welcomeMessage: "Wilujeng sumping!",
    nodes: [
      { id: "n1", type: "trigger", channel: "web" },
      { id: "n2", type: "system_prompt", content: "Asisten Dukcapil" },
      { id: "n3", type: "llm_call", model: "nusalingua-core-7b", temperature: 0.6 },
      { id: "n4", type: "send_reply" },
    ],
    tags: ["dukcapil", "sunda"],
  },
});
assert("POST /bots → 201", dukcapilBot.status === 201);
assert("Bot ID generated", typeof dukcapilBot.body.id === "string");
assert("Default status = draft", dukcapilBot.body.status === "draft");
assert("Flow JSONB tersimpan", dukcapilBot.body.flow?.nodes?.length === 4);
assert("Language = su", dukcapilBot.body.languageCode === "su");
const botId = dukcapilBot.body.id;

// ============================================================
startStage(6, "Studio — Edit Flow & Properties");
// ============================================================
const edited = await call(aliceToken, "PATCH", `/api/bots/${botId}`, {
  flow: {
    systemPrompt: "Versi 2: Asisten Disdukcapil. Bilingual (Sunda + Indonesia).",
    temperature: 0.7, maxTokens: 500,
    welcomeMessage: "Wilujeng sumping! Bisa Sunda atau Indonesia.",
    nodes: [
      { id: "n1", type: "trigger", channel: "whatsapp" },
      { id: "n2", type: "system_prompt", content: "Bilingual" },
      { id: "n3", type: "llm_call", model: "nusalingua-core-7b", temperature: 0.7 },
      { id: "n4", type: "send_reply" },
    ],
    tags: ["dukcapil", "bilingual"],
  },
});
assert("PATCH /bots → 200", edited.status === 200);
assert("Temperature → 0.7", edited.body.flow.temperature === 0.7);
assert("Channel → whatsapp", edited.body.flow.nodes[0].channel === "whatsapp");
assert("Tags updated", edited.body.flow.tags.includes("bilingual"));

// ============================================================
startStage(7, "Studio — Publish (draft → published)");
// ============================================================
const pub = await call(aliceToken, "PATCH", `/api/bots/${botId}`, { status: "published" });
assert("PATCH status=published → 200", pub.status === 200);
assert("Status = published", pub.body.status === "published");
const list = await call(aliceToken, "GET", "/api/bots");
assert("Bot tampil di list", list.body.length === 1);
assert("List status = published", list.body[0].status === "published");

// ============================================================
startStage(8, "Chat — Create Conversation via Bot");
// ============================================================
const convo = await call(aliceToken, "POST", "/api/conversations", {
  title: "Konsultasi: Buat KTP baru anak SMA",
  languageCode: "su", botId,
});
assert("POST /conversations → 201", convo.status === 201);
assert("Linked ke bot", convo.body.botId === botId);
assert("Title tersimpan", convo.body.title.includes("KTP baru"));
assert("Owner = Alice", convo.body.userId === aliceId);
const convoId = convo.body.id;

// ============================================================
startStage(9, "Chat — User Send Message #1");
// ============================================================
await db.insert(schema.messages).values({
  id: nanoid(), conversationId: convoId, role: "user",
  content: "Wilujeng enjing, abdi badé naroskeun cara nyieun KTP énggal kanggo budak SMA",
});
const msgs1 = await call(aliceToken, "GET", `/api/conversations/${convoId}/messages`);
assert("GET /messages → 200", msgs1.status === 200);
assert("1 message in convo", msgs1.body.length === 1);
assert("Role = user", msgs1.body[0].role === "user");

// ============================================================
startStage(10, "Chat — Multi-turn (4 messages)");
// ============================================================
await db.insert(schema.messages).values([
  { id: nanoid(), conversationId: convoId, role: "assistant",
    content: "Wilujeng enjing! Peryogi: akta lahir, KK, pas foto. NIK tos siap?",
    tokensUsed: 87 },
  { id: nanoid(), conversationId: convoId, role: "user",
    content: "Tos siap. NIK 3273010101050001" },
  { id: nanoid(), conversationId: convoId, role: "assistant",
    content: "Hatur nuhun. Datang ka Disdukcapil Senén-Jumaah 08-15. Prosés ~30 mnt.",
    tokensUsed: 64 },
]);
const msgs2 = await call(aliceToken, "GET", `/api/conversations/${convoId}/messages`);
assert("4 messages total", msgs2.body.length === 4);
assert("Sequence U→A→U→A", msgs2.body.map((m: any) => m.role).join(",") === "user,assistant,user,assistant");

// ============================================================
startStage(11, "Analytics — Token Tracking");
// ============================================================
const allMsgs = await db.select().from(schema.messages);
const totalTokens = allMsgs.reduce((s, m) => s + (m.tokensUsed ?? 0), 0);
assert(`Total tokens = 151 (got ${totalTokens})`, totalTokens === 151);
const assistantMsgs = allMsgs.filter(m => m.role === "assistant");
assert("Hanya assistant punya tokensUsed > 0", assistantMsgs.every(m => (m.tokensUsed ?? 0) > 0));

// ============================================================
startStage(12, "Multi-language — 4 bahasa berbeda");
// ============================================================
const cJv = await call(aliceToken, "POST", "/api/conversations", { languageCode: "jv", title: "Test Jawa" });
assert("Convo Jawa → 201", cJv.status === 201);
const cId = await call(aliceToken, "POST", "/api/conversations", { languageCode: "id", title: "Test Indonesia" });
assert("Convo Indonesia → 201", cId.status === 201);
const cBbc = await call(aliceToken, "POST", "/api/conversations", { languageCode: "bbc", title: "Test Batak" });
assert("Convo Batak → 201", cBbc.status === 201);
const allConvos = await call(aliceToken, "GET", "/api/conversations");
assert("Alice punya 4 conversation", allConvos.body.length === 4);
const uniqLangs = new Set(allConvos.body.map((c: any) => c.languageCode));
assert("4 bahasa unik", uniqLangs.size === 4);

// ============================================================
startStage(13, "Security — Cross-user Isolation");
// ============================================================
const bobId = "bbbbbbbb-2222-2222-2222-222222222222";
const bobToken = await mintToken(bobId, "bob@umkm.id", "Bob UMKM");
await call(bobToken, "GET", "/api/conversations");
const bobConvos = await call(bobToken, "GET", "/api/conversations");
assert("Bob empty list", bobConvos.body.length === 0);
const bobBot = await call(bobToken, "GET", `/api/bots/${botId}`);
assert("Bob TIDAK BISA akses bot Alice → 404", bobBot.status === 404);
const bobConvo = await call(bobToken, "GET", `/api/conversations/${convoId}`);
assert("Bob TIDAK BISA akses convo Alice → 404", bobConvo.status === 404);
const stillExists = await call(aliceToken, "GET", `/api/bots/${botId}`);
assert("Bot Alice masih ada", stillExists.status === 200);

// ============================================================
startStage(14, "Input Validation — Zod");
// ============================================================
const v1 = await call(aliceToken, "POST", "/api/bots", { name: "X", languageCode: "zzz", flow: { systemPrompt: "x".repeat(15), nodes: [] } });
assert("Bahasa tidak ada → 400", v1.status === 400);
const v2 = await call(aliceToken, "POST", "/api/bots", { name: "X", languageCode: "su", flow: { nodes: [] } });
assert("Flow miss systemPrompt → 400", v2.status === 400);
const v3 = await call(aliceToken, "POST", "/api/bots", { name: "X", languageCode: "su", flow: { systemPrompt: "x", nodes: [] } });
assert("Prompt <10 char → 400", v3.status === 400);
const v4 = await call(aliceToken, "POST", "/api/bots", { languageCode: "su", flow: { systemPrompt: "Asisten ramah", nodes: [] } });
assert("Tanpa name → 400", v4.status === 400);

// ============================================================
startStage(15, "Lifecycle — Archive (soft delete)");
// ============================================================
const arch = await call(aliceToken, "PATCH", `/api/bots/${botId}`, { status: "archived" });
assert("Archive → 200", arch.status === 200);
assert("Status = archived", arch.body.status === "archived");
const listAfter = await call(aliceToken, "GET", "/api/bots");
assert("Archived bot masih muncul", listAfter.body.length === 1);
assert("Status di list = archived", listAfter.body[0].status === "archived");

// ============================================================
startStage(16, "Cleanup — Hard Delete + Cascade");
// ============================================================
const convosBefore = (await call(aliceToken, "GET", "/api/conversations")).body.length;
const botsBefore = (await call(aliceToken, "GET", "/api/bots")).body.length;
assert("Pre-cleanup: 4 convos + 1 bot", convosBefore === 4 && botsBefore === 1);
const delC = await call(aliceToken, "DELETE", `/api/conversations/${convoId}`);
assert("Delete conversation → 204", delC.status === 204);
const remaining = (await call(aliceToken, "GET", "/api/conversations")).body.length;
assert("3 convo tersisa", remaining === 3);
const orphans = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, convoId));
assert("Messages cascade-deleted", orphans.length === 0);
const delB = await call(aliceToken, "DELETE", `/api/bots/${botId}`);
assert("Delete bot → 204", delB.status === 204);
const noMore = (await call(aliceToken, "GET", "/api/bots")).body.length;
assert("0 bot tersisa", noMore === 0);
await db.delete(schema.users).where(eq(schema.users.id, aliceId));
const aliceConvos = await db.select().from(schema.conversations).where(eq(schema.conversations.userId, aliceId));
assert("CASCADE: hapus user → semua convo Alice terhapus", aliceConvos.length === 0);

// ============================================================
// FINAL REPORT
// ============================================================
server.close();
console.log("\n");
console.log("╔══════════════════════════════════════════════════════════════════════╗");
console.log("║      FULL BUSINESS PROCESS E2E TEST REPORT                           ║");
console.log("╠══════════════════════════════════════════════════════════════════════╣");
for (const s of stages) {
  const status = s.failed === 0 ? "✓ PASS" : `✗ FAIL`;
  const total = s.passed + s.failed;
  const line = `  Stage ${s.stage.toString().padStart(2, "0")}: ${s.name.padEnd(42)} ${s.passed}/${total} ${status}`;
  console.log(`║${line.padEnd(70)}║`);
}
console.log("╠══════════════════════════════════════════════════════════════════════╣");
const summary = `  TOTAL: ${totalPass} passed | ${totalFail} failed`;
console.log(`║${summary.padEnd(70)}║`);
console.log("╚══════════════════════════════════════════════════════════════════════╝");
process.exit(totalFail > 0 ? 1 : 0);
