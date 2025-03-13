import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
// Middleware to check if the user is authenticated
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Store decoded token (e.g., containing userId) in the context
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 403);
  }
};


export default authMiddleware;