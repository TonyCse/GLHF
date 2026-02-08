const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const plansData = [
      {
        name: 'Plan Bronze',
        slug: 'bronze',
        priceCents: 99,
        currency: 'EUR',
        tokensPerMonth: 5,
      },
      {
        name: 'Plan Argent',
        slug: 'silver',
        priceCents: 149,
        currency: 'EUR',
        tokensPerMonth: 8,
      },
      {
        name: 'Plan Or',
        slug: 'gold',
        priceCents: 199,
        currency: 'EUR',
        tokensPerMonth: 30,
      },
    ];

    for (const p of plansData) {
      const upserted = await prisma.plan.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          priceCents: p.priceCents,
          currency: p.currency,
          tokensPerMonth: p.tokensPerMonth,
        },
        create: p,
      });
      console.log('Upserted plan:', upserted.slug, upserted.id);
    }

    const all = await prisma.plan.findMany({ orderBy: { priceCents: 'asc' } });
    console.log('\nPlans now in DB:', all.length);
    console.table(
      all.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        price: (a.priceCents / 100).toFixed(2) + ' EUR',
        tokens: a.tokensPerMonth,
      }))
    );
  } catch (e) {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
