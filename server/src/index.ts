import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { healthRouter } from "./routes/health.js";
import { languagesRouter } from "./routes/languages.js";
import { conversationsRouter } from "./routes/conversations.js";
import { messagesRouter } from "./routes/messages.js";
import { voiceRouter } from "./routes/voice.js";
import { botsRouter } from "./routes/bots.js";
import { statsRouter } from "./routes/stats.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// Di belakang nginx reverse proxy: percayai X-Forwarded-* (1 hop)
// agar req.ip / req.protocol benar (penting untuk logging & rate limiting).
app.set("trust proxy", 1);

// ============================================
// MIDDLEWARE
// ============================================
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

if (env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================
app.use("/api", healthRouter);
app.use("/api", languagesRouter);
app.use("/api", conversationsRouter);
app.use("/api", messagesRouter);
app.use("/api", voiceRouter);
app.use("/api", botsRouter);
app.use("/api", statsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

// Production: bind hanya ke loopback — akses publik wajib lewat nginx.
// Development: bind semua interface agar mudah diakses (mis. dari device lain).
const HOST = env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0";

app.listen(env.PORT, HOST, () => {
  console.log(`\n🚀 NusaLingua server siap di http://${HOST}:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CLIENT_ORIGIN}`);
  console.log(`   Chat model:  ${env.OPENAI_CHAT_MODEL}`);
  console.log(`   Voice model: ${env.OPENAI_REALTIME_MODEL}`);
  console.log(`   Supabase:    ${env.SUPABASE_URL}\n`);
});
