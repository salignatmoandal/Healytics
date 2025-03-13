import prisma from '../../prisma/prisma-client';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}