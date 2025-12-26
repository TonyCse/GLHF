const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const plansData = [
      {
        name: 'GLHF Chill',
        slug: 'glhf-chill',
        priceCents: 99,
        currency: 'EUR',
        tokensPerWeek: 1,
        paypalPlanId: null,
      },
      {
        name: 'GLHF Tryhard',
        slug: 'glhf-tryhard',
        priceCents: 199,
        currency: 'EUR',
        tokensPerWeek: 3,
        paypalPlanId: null,
      },
      {
        name: 'GLHF Legend',
        slug: 'glhf-legend',
        priceCents: 299,
        currency: 'EUR',
        tokensPerWeek: 8,
        paypalPlanId: null,
      },
    ];

    for (const p of plansData) {
      const upserted = await prisma.plan.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          priceCents: p.priceCents,
          currency: p.currency,
          tokensPerWeek: p.tokensPerWeek,
          paypalPlanId: p.paypalPlanId,
        },
        create: p,
      });
      console.log('Upserted plan:', upserted.slug, upserted.id);
    }

    const all = await prisma.plan.findMany({ orderBy: { priceCents: 'asc' } });
    console.log('\nPlans now in DB:', all.length);
    console.table(
      all.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        price: (a.priceCents / 100).toFixed(2) + '€',
        tokens: a.tokensPerWeek,
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
