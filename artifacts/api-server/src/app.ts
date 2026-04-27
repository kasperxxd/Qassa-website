import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

// In production (e.g. Render single-service deploy), serve the built
// qassa frontend from the same Node process. Skipped in dev so Vite
// keeps owning the client.
if (process.env["NODE_ENV"] === "production") {
  const staticDir = path.resolve(
    process.cwd(),
    process.env["STATIC_DIR"] ?? "artifacts/qassa/dist/public",
  );

  if (existsSync(staticDir)) {
    logger.info({ staticDir }, "Serving static frontend");
    app.use(express.static(staticDir, { index: false, maxAge: "1h" }));

    // SPA fallback: any non-/api GET serves index.html so wouter can route.
    app.get(/^(?!\/api(?:\/|$)).*/, (_req: Request, res: Response): void => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  } else {
    logger.warn(
      { staticDir },
      "STATIC_DIR not found — frontend will not be served. Did you build the qassa artifact?",
    );
  }
}

export default app;
