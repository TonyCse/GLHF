import crypto from "crypto";

export function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashVerificationToken(token) };
}
