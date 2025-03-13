import { Hono } from "hono";
import authRoutes from "./src/routes/auth";
import symptomRoutes from "./src/routes/symptom";
import pdfRoutes from "./src/routes/pdf";
import aiRoutes from "./src/routes/ai";

import { loggerMiddleware } from "./src/middlewares/loggerMiddleware";
import { errorMiddleware, errorHandler } from "./src/middlewares/errorMiddleware";
import usersRoutes from "./src/routes/user";

const app = new Hono();

// Global middleware
app.use("*", loggerMiddleware);
app.use("*", errorMiddleware);
app.onError(errorHandler);

// Register routes
app.route("/auth", authRoutes);
app.route("/symptom", symptomRoutes);
app.route("/pdf", pdfRoutes);
app.route("/ai", aiRoutes);
app.route("/users", usersRoutes);
Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("🚀 Server running on http://localhost:3000");