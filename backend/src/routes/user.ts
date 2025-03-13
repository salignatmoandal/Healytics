// src/routes/users.ts
import { Hono } from 'hono';
import { UserController } from '../controllers/userController';

const usersRoutes = new Hono();

usersRoutes.get('/', UserController.getAllUsers);

export default usersRoutes;