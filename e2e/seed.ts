import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env', override: false });

const prisma = new PrismaClient();

const DEFAULT_EMAIL = 'e2e_user@example.com';
const DEFAULT_PSEUDO = 'e2e_user';

export async function seedE2E() {
  if (process.env.NODE_ENV === 'production') return;

  const email = process.env.TEST_USER_EMAIL || DEFAULT_EMAIL;
  const pseudo = process.env.TEST_USER_PSEUDO || DEFAULT_PSEUDO;
  const password = process.env.TEST_USER_PASSWORD || 'E2ePassw0rd!';

  const freePlan =
    (await prisma.plan.findFirst({ where: { priceCents: 0 } })) ||
    (await prisma.plan.findFirst({ where: { slug: 'free' } })) ||
    (await prisma.plan.create({
      data: {
        name: 'Plan Gratuit',
        slug: 'free',
        priceCents: 0,
        currency: 'EUR',
        tokensPerMonth: 3,
      },
    }));

  const hashed = await bcrypt.hash(password, 10);
  const testUser = await prisma.user.upsert({
    where: { email },
    update: {
      pseudo,
      password: hashed,
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null,
      isDeleted: false,
      planId: freePlan.id,
      tokensUsedThisMonth: 0,
    },
    create: {
      pseudo,
      email,
      password: hashed,
      avatarUrl: `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(pseudo)}`,
      emailVerifiedAt: new Date(),
      planId: freePlan.id,
    },
  });

  const deletedUserEmail = 'deleted_e2e@glhf.local';
  const deletedUser = await prisma.user.upsert({
    where: { email: deletedUserEmail },
    update: {
      pseudo: 'deleted_e2e',
      isDeleted: true,
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null,
    },
    create: {
      pseudo: 'deleted_e2e',
      email: deletedUserEmail,
      password: hashed,
      isDeleted: true,
      emailVerifiedAt: new Date(),
      planId: freePlan.id,
    },
  });

  const now = new Date();
  const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const ensureTournament = async (name: string, createdById: number, date: Date, winnerId?: number | null) => {
    const existing = await prisma.tournament.findFirst({ where: { name, createdById } });
    if (existing) {
      return prisma.tournament.update({
        where: { id: existing.id },
        data: {
          date,
          winnerId: winnerId ?? null,
          isDeleted: false,
        },
      });
    }
    return prisma.tournament.create({
      data: {
        name,
        description: 'Tournoi E2E seed',
        game: 'VALORANT',
        date,
        maxPlayers: 8,
        createdById,
        winnerId: winnerId ?? null,
      },
    });
  };

  const recruitingTournament = await ensureTournament(
    'E2E Recruiting Tournament',
    testUser.id,
    addDays(7),
    null,
  );

  const bracketTournament = await ensureTournament(
    'E2E Bracket Tournament',
    testUser.id,
    addDays(10),
    null,
  );

  const deletedTournament = await ensureTournament(
    'E2E Deleted Creator Tournament',
    deletedUser.id,
    addDays(12),
    null,
  );

  await prisma.tournamentParticipant.upsert({
    where: {
      tournamentId_userId: { tournamentId: bracketTournament.id, userId: testUser.id },
    },
    update: { isActive: true },
    create: { tournamentId: bracketTournament.id, userId: testUser.id, isActive: true },
  });

  await prisma.tournamentParticipant.upsert({
    where: {
      tournamentId_userId: { tournamentId: bracketTournament.id, userId: deletedUser.id },
    },
    update: { isActive: true },
    create: { tournamentId: bracketTournament.id, userId: deletedUser.id, isActive: true },
  });

  // Ensure recruiting tournament has no participants for join tests
  await prisma.tournamentParticipant.deleteMany({
    where: { tournamentId: recruitingTournament.id },
  });

  // Ensure deleted tournament shows deleted creator
  await prisma.tournament.update({
    where: { id: deletedTournament.id },
    data: { winnerId: deletedUser.id },
  });
}

export async function closeSeedConnection() {
  await prisma.$disconnect();
}
