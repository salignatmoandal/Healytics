// src/controllers/userController.ts
import { Context } from 'hono';
import { UserService } from '../services/userService';


export class UserController {
  static async getAllUsers(c: Context) {
    try {
      const users = await UserService.getAllUsers();
      return c.json(users);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  }
}
