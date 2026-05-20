/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const plans = await prisma.plan.findMany();
    console.log("Plans found:", plans.length);
    console.dir(plans, { depth: null });
  } catch (e) {
    console.error("Error querying plans:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
