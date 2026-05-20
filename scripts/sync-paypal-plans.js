/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function loadEnv() {
  const candidates = [".env.local", ".env"];

  for (const file of candidates) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath, override: false });
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

async function getAccessToken(baseUrl, clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status} - ${text}`);
  }

  return JSON.parse(text).access_token;
}

async function fetchPaypalPlan(baseUrl, accessToken, planId) {
  const res = await fetch(`${baseUrl}/v1/billing/plans/${planId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayPal fetch plan error: ${res.status} - ${text}`);
  }

  return JSON.parse(text);
}

async function createPaypalPlan(baseUrl, accessToken, oldPlan, localPlan) {
  const price = (localPlan.priceCents / 100).toFixed(2);
  const description =
    oldPlan.description || `${localPlan.name} monthly plan`;

  const body = {
    product_id: oldPlan.product_id,
    name: localPlan.name,
    description,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: {
          interval_unit: "MONTH",
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: price,
            currency_code: localPlan.currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      payment_failure_threshold: 3,
    },
  };

  const res = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayPal create plan error: ${res.status} - ${text}`);
  }

  return JSON.parse(text);
}

async function main() {
  loadEnv();

  const baseUrl = requiredEnv("PAYPAL_BASE_URL");
  const clientId = requiredEnv("PAYPAL_CLIENT_ID");
  const clientSecret = requiredEnv("PAYPAL_CLIENT_SECRET");

  const accessToken = await getAccessToken(baseUrl, clientId, clientSecret);
  const localPlans = await prisma.plan.findMany({
    where: {
      priceCents: {
        gt: 0,
      },
      paypalPlanId: {
        not: null,
      },
    },
    orderBy: {
      priceCents: "asc",
    },
  });

  if (localPlans.length === 0) {
    console.log("Aucun plan payant avec paypalPlanId trouve.");
    return;
  }

  for (const localPlan of localPlans) {
    const oldPlan = await fetchPaypalPlan(baseUrl, accessToken, localPlan.paypalPlanId);
    const oldPrice = oldPlan.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value;
    const newPrice = (localPlan.priceCents / 100).toFixed(2);

    if (oldPrice === newPrice) {
      console.log(
        `OK ${localPlan.slug}: ${localPlan.paypalPlanId} deja aligne sur ${newPrice} ${localPlan.currency}`,
      );
      continue;
    }

    const createdPlan = await createPaypalPlan(baseUrl, accessToken, oldPlan, localPlan);

    await prisma.plan.update({
      where: { id: localPlan.id },
      data: { paypalPlanId: createdPlan.id },
    });

    console.log(
      `SYNC ${localPlan.slug}: ${localPlan.paypalPlanId} (${oldPrice} ${localPlan.currency}) -> ${createdPlan.id} (${newPrice} ${localPlan.currency})`,
    );
  }
}

main()
  .catch((error) => {
    console.error("Erreur sync PayPal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
