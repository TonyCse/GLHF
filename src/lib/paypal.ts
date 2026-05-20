type PayPalConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

function getPayPalConfig(): PayPalConfig {
  const baseUrl = process.env.PAYPAL_BASE_URL;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("Configuration PayPal manquante");
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
    throw new Error(`Erreur token PayPal : ${res.status} - ${text}`);
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
    throw new Error(`Erreur création abonnement PayPal : ${res.status} - ${text}`);
  }

  const data = await res.json();
  const approvalUrl = data.links?.find(
    (l: { rel?: string; href?: string }) => l.rel === "approve",
  )?.href;

  if (!approvalUrl || !data.id) {
    throw new Error("Lien d'approbation PayPal manquant");
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
    throw new Error(`Erreur récupération abonnement PayPal : ${res.status} - ${text}`);
  }

  return res.json();
}

export async function cancelPaypalSubscription(subscriptionId: string, reason: string) {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getAccessToken();

  const res = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur annulation PayPal : ${res.status} - ${text}`);
  }
}

export async function verifyPaypalWebhookSignature(
  body: unknown,
  headers: Headers,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return false;
  }

  const { baseUrl } = getPayPalConfig();
  const accessToken = await getAccessToken();
  const res = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data?.verification_status === "SUCCESS";
}
