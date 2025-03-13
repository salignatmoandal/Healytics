  // prisma/seed.ts
  import { PrismaClient } from '@prisma/client'
  
  const prisma = new PrismaClient()
  
  async function main() {
    // Créez vos données de test ici
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User'
      }
    })
  }
  
  main()
    .catch(e => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })