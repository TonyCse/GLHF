const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Test de la connexion à la base de données...');
    const users = await prisma.user.findMany();
    console.log('✅ Connexion réussie ! Nombre d\'utilisateurs:', users.length);
  } catch (error) {
    console.error('❌ Erreur de connexion :', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
