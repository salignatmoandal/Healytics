import prisma from '../../prisma/prisma-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key';

export class AuthService {
  static async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({ data: { email, password: hashedPassword } });
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  }
}