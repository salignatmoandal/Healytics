import prisma from '../../prisma/prisma-client';

export class SymptomService {
  // Create a new symptom record for a user
  static async create(userId: string, details: string) {
    return prisma.symptom.create({
      data: {
        userId,
        details,
      },
    });
  }

  // Retrieve all symptom records for a user
  static async getAll(userId: string) {
    return prisma.symptom.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}