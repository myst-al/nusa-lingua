import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "nusalingua-server",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});
