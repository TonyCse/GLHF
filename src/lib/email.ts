import nodemailer from "nodemailer";

type VerificationEmailInput = {
  to: string;
  pseudo: string;
  token: string;
  appUrl: string;
};

type ContactEmailInput = {
  name: string;
  fromEmail: string;
  message: string;
};

type PasswordResetEmailInput = {
  to: string;
  pseudo: string;
  token: string;
  appUrl: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = (process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const smtpTlsRejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED;
  const rejectUnauthorized =
    smtpTlsRejectUnauthorized != null && smtpTlsRejectUnauthorized !== ""
      ? smtpTlsRejectUnauthorized.toLowerCase() !== "false"
      : !(host || "").toLowerCase().includes("hostinger.com");

  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!port) missing.push("SMTP_PORT");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (missing.length > 0) {
    throw new Error(`SMTP non configure: ${missing.join(", ")}`);
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized, servername: host },
  };
}

export async function sendVerificationEmail({ to, pseudo, token, appUrl }: VerificationEmailInput) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const from = process.env.EMAIL_FROM || "contact@gl-hf.site";
  const verificationUrl = `${appUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const subject = "Confirmez votre email GLHF";
  const text = [
    `Bonjour ${pseudo},`,
    "",
    "Merci pour votre inscription sur GLHF.",
    "Confirmez votre email en cliquant sur ce lien :",
    verificationUrl,
    "",
    "Si vous n'\u00eates pas \u00e0 l'origine de cette demande, ignorez cet email.",
  ].join("\n");
  const html = `
    <p>Bonjour ${escapeHtml(pseudo)},</p>
    <p>Merci pour votre inscription sur GLHF.</p>
    <p>
      Confirmez votre email en cliquant sur ce lien :
      <a href="${verificationUrl}">Confirmer mon email</a>
    </p>
    <p>Si vous n'\u00eates pas \u00e0 l'origine de cette demande, ignorez cet email.</p>
  `;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    // Avoid logging secrets; include only connection metadata.
    throw error;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactEmail({ name, fromEmail, message }: ContactEmailInput) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "contact@gl-hf.site";
  const to = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || from;
  const subject = `Nouveau message de contact - ${name}`;
  const text = [`Nom: ${name}`, `Email: ${fromEmail}`, "", "Message:", message].join("\n");
  const html = `
    <p><strong>Nom:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(fromEmail)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  try {
    await transporter.sendMail({ from, to, replyTo: fromEmail, subject, text, html });
  } catch (error) {
    throw error;
  }
}

export async function sendPasswordResetEmail({
  to,
  pseudo,
  token,
  appUrl,
}: PasswordResetEmailInput) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const from = process.env.EMAIL_FROM || "contact@gl-hf.site";
  const resetUrl = `${appUrl.replace(/\/$/, "")}/reinitialisation-mot-de-passe/${encodeURIComponent(token)}`;
  const subject = "Réinitialisez votre mot de passe GLHF";
  const text = [
    `Bonjour ${pseudo},`,
    "",
    "Vous avez demand\u00e9 la r\u00e9initialisation de votre mot de passe GLHF.",
    "Cliquez sur ce lien pour d\u00e9finir un nouveau mot de passe :",
    resetUrl,
    "",
    "Ce lien expire dans 1 heure.",
    "Si vous n'\u00eates pas \u00e0 l'origine de cette demande, ignorez cet email.",
  ].join("\n");
  const html = `
    <p>Bonjour ${escapeHtml(pseudo)},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe GLHF.</p>
    <p>
      Cliquez sur ce lien pour définir un nouveau mot de passe :
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
    </p>
    <p>Ce lien expire dans 1 heure.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
  `;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    throw error;
  }
}
