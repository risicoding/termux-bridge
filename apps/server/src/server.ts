import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "@termux-bridge/logger";
import {
  Battery,
  CallLog,
  Clipboard,
  Notification,
  Sms,
} from "@termux-bridge/core";
import { PORT } from "./constants";

export const initServer = () => {
  const app = new Hono().basePath("/api/v0");

  app.get("/ping", (c) => c.json({ name: "termux-bridge", status: "running" }));

  app.get("/battery", async (c) => {
    const res = await Battery.status();

    if (res.isErr()) {
      logger.error(res.error.log());
      return c.json({
        status: "error",
        message: res.error.message,
        error: res.error,
      });
    }

    return c.json({ status: "ok", data: res.value });
  });

  app.get("/clipboard", async (c) => {
    const res = await Clipboard.getClipboard();

    if (res.isErr()) {
      logger.error(res.error.log());
      return c.json({
        status: "error",
        message: res.error.message,
        error: res.error,
      });
    }

    return c.json({ status: "ok", data: res.value });
  });

  app.get("/sms", async (c) => {
    const res = await Sms.list();

    if (res.isErr()) {
      logger.error(res.error.log());
      return c.json({
        status: "error",
        message: res.error.message,
        error: res.error,
      });
    }

    return c.json({ status: "ok", data: res.value });
  });

  app.get("/notification/list", async (c) => {
    const res = await Notification.list();

    if (res.isErr()) {
      logger.error(res.error.log());
      return c.json({
        status: "error",
        message: res.error.message,
        error: res.error,
      });
    }

    return c.json({ status: "ok", data: res.value });
  });

  app.get("/call", async (c) => {
    const res = await CallLog.log();

    if (res.isErr()) {
      logger.error(res.error.log());
      return c.json({
        status: "error",
        message: res.error.message,
        error: res.error,
      });
    }

    return c.json({ status: "ok", data: res.value });
  });

  app.get("/kill", (c) => {
    logger.warn("Received kill command shutting down...");
    setImmediate(() => {
      process.exit(0);
    });
    return c.json({ status: "ok", message: "server shutting down" });
  });

  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (i) => logger.info(`Server running on ${i.port}`),
  );

  process.on("SIGTERM", () => {
    logger.warn("Received SIGTERM. Shutting down...");
    // Clean up here
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.warn("Received SIGINT");
    process.exit(0);
  });
};

initServer();
