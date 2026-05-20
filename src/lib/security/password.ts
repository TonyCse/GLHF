const PASSWORD_MIN = 12;
const PASSWORD_MAX = 72;
const RULES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
  whitespace: /\s/,
};

export function validatePassword(password: string) {
  const bytes = Buffer.byteLength(password, "utf8");
  const categories = [RULES.lower, RULES.upper, RULES.number, RULES.special].filter((rule) =>
    rule.test(password),
  ).length;

  if (
    password.length < PASSWORD_MIN ||
    password.length > PASSWORD_MAX ||
    bytes > PASSWORD_MAX ||
    RULES.whitespace.test(password) ||
    categories < 3
  ) {
    return {
      ok: false,
      message: "Mot de passe trop faible (min 12 caractères, 3 types requis, sans espace)",
    };
  }

  return { ok: true };
}
