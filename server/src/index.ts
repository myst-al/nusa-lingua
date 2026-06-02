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

app.listen(env.PORT, () => {
  console.log(`\n🚀 NusaLingua server siap di http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CLIENT_ORIGIN}`);
  console.log(`   Chat model:  ${env.OPENAI_CHAT_MODEL}`);
  console.log(`   Voice model: ${env.OPENAI_REALTIME_MODEL}`);
  console.log(`   Supabase:    ${env.SUPABASE_URL}\n`);
});
