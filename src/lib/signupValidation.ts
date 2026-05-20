import { z } from "zod";

export const inscriptionSchema = z.object({
  pseudo: z.string().min(3).max(20).regex(/^[a-zA-Z0-9._-]{3,20}$/),
  email: z.string().email(),
  password: z.string().min(12).max(72).refine(
    (val) => {
      const categories = [
        /[a-z]/.test(val),
        /[A-Z]/.test(val),
        /\d/.test(val),
        /[^A-Za-z0-9]/.test(val),
      ].filter(Boolean).length;
      return !/\s/.test(val) && categories >= 3;
    },
    {
      message:
        "Mot de passe trop faible (min 12 caractères, 3 types requis, sans espace)",
    }
  ),
  isOver16: z.literal(true, {
    errorMap: () => ({ message: "Vous devez avoir au moins 16 ans pour vous inscrire." }),
  }),
});
