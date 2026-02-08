# GLHF

GLHF est une plateforme web pour organiser et participer a des tournois de jeux video. Le produit integre un systeme de tokens mensuels, des abonnements PayPal, un espace admin et des pages communautaires (classements, profils, tournois).

## Fonctionnalites

- Creation et participation aux tournois
- Brackets et suivi des matchs
- Systemes de tokens mensuels avec reset automatique
- Abonnements PayPal (plans gratuits et premium)
- Espace admin (gestion des tournois, utilisateurs, paiements)
- Pages publiques : home, classement, profils

## Stack technique

- Next.js (App Router) + TypeScript
- Prisma + MySQL
- NextAuth v5
- Tailwind CSS
- PayPal SDK

## Prerequis

- Node.js 20+
- MySQL (ou base compatible Prisma)

## Installation

1. Installer les dependances :
   ```bash
   npm install
   ```
1. Copier les variables d'environnement :
   ```bash
   cp .env.example .env.local
   ```
1. Configurer la base de donnees et Prisma :
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
1. Initialiser les forfaits (optionnel si deja en base) :
   ```bash
   node scripts/seed-plans.js
   ```
1. Lancer le serveur de dev :
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Documentation

- `TOKENS_SYSTEM.md` pour la logique tokens et les endpoints

## Captures d'ecran

Ajoutez vos captures dans `docs/` (ex : `docs/home.png`) et referencez-les ici pour illustrer l'app.
