import { Hono } from 'hono';
import { AuthController } from '../controllers/authController';

const authRoutes = new Hono();

authRoutes.post('/register', AuthController.register);
authRoutes.post('/login', AuthController.login);

export default authRoutes;