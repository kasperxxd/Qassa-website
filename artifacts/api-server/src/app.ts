if (process.env["NODE_ENV"] === "production") {
  const staticDir = path.resolve(
    process.cwd(),
    process.env["STATIC_DIR"] ?? "artifacts/qassa/dist",
  );

  if (existsSync(staticDir)) {
    logger.info({ staticDir }, "Serving static frontend");

    app.use(express.static(staticDir));

    // SPA fallback
    app.get(/^(?!\/api(?:\/|$)).*/, (_req: Request, res: Response): void => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  } else {
    logger.warn(
      { staticDir },
      "Frontend build not found — check qassa build output",
    );
  }
}
