import type { Context } from "hono";
import { AuthService } from "../services/authService";

export class AuthController {
  static async register(c: Context) {
    try {
      const { email, password } = await c.req.json();
      const user = await AuthService.register(email, password);
      return c.json({ user });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }

  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json();
      const token = await AuthService.login(email, password);
      return c.json({ token });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
}