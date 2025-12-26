import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { email, password, pseudo } = req.body;

  if (!email || !password || !pseudo) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        pseudo,
      },
    });

    return res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la création du compte", error });
  }
}
