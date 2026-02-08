type PayPalConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

function getPayPalConfig(): PayPalConfig {
  const baseUrl = process.env.PAYPAL_BASE_URL;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("PayPal config missing");
  }

  return { baseUrl, clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { baseUrl, clientId, clientSecret } = getPayPalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function createPaypalSubscription(params: {
  paypalPlanId: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
}) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getAccessToken();

  const res = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: params.paypalPlanId,
      custom_id: params.customId,
      application_context: {
        brand_name: "GLHF",
        user_action: "SUBSCRIBE_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal subscription error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  const approvalUrl = data.links?.find((l: any) => l.rel === "approve")?.href;

  if (!approvalUrl || !data.id) {
    throw new Error("PayPal approval link missing");
  }

  return { subscriptionId: data.id as string, approvalUrl: approvalUrl as string };
}

export async function getPaypalSubscription(subscriptionId: string) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getAccessToken();

  const res = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal subscription fetch error: ${res.status} - ${text}`);
  }

  return res.json();
}

export async function cancelPaypalSubscription(
  subscriptionId: string,
  reason: string
) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal cancel error: ${res.status} - ${text}`);
  }
}
