<p align="center">
  <img src="https://www.gl-hf.site/_next/image?url=%2Fimages%2Flogo.webp&w=384&q=75" width="120" />
</p>

<h1 align="center">GLHF 🎮</h1>

<p align="center">
  Plateforme esports pour créer, gérer et participer à des tournois en ligne.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" />
  <img src="https://img.shields.io/badge/TypeScript-blue" />
  <img src="https://img.shields.io/badge/Prisma-2D3748" />
  <img src="https://img.shields.io/badge/MySQL-orange" />
  <img src="https://img.shields.io/badge/PayPal-00457C" />
</p>

---

## 🚀 À propos

**GLHF** est une plateforme web dédiée à l’esport permettant :

- 🎯 Créer et rejoindre des tournois
- 🧠 Suivre des brackets dynamiques
- 💰 Utiliser un système de tokens mensuels
- 💳 Gérer des abonnements PayPal
- 🛠 Accéder à un dashboard admin complet
- 🌍 Explorer des pages communautaires (classements, profils)

---

## 🎨 Design System

- Univers : **néon, compétitif, communautaire**
- Palette :
  - `#8F60D0`
  - `#A855F7`
  - `#232426`
  - `#1C1D1F`
  - `#FFFFFF`

---

## ⚙️ Stack technique

Frontend → Next.js (App Router) + TypeScript + Tailwind  
Backend → API Routes (Next.js)  
Database → Prisma + MySQL  
Auth → NextAuth v5  
Paiement → PayPal SDK  

---

## ✨ Fonctionnalités

- ✔ Création / participation aux tournois  
- ✔ Brackets interactifs  
- ✔ Système de tokens mensuels (reset auto)  
- ✔ Abonnements (gratuit + premium)  
- ✔ Dashboard admin  
- ✔ Profils utilisateurs & classement  

---

## 💰 Système de tokens

| Plan     | Tokens | Prix  |
|----------|--------|-------|
| Gratuit  | 3      | 0€    |
| Bronze   | 5      | 0.99€ |
| Argent   | 8      | 1.49€ |
| Or       | 30     | 1.99€ |

- 🔄 Reset automatique chaque mois  
- 🎟 1 token = 1 participation  
- 🔙 Remboursement si tournoi non commencé  

---

## 📦 Installation

npm install  
cp .env.example .env.local  
npx prisma migrate dev  
npx prisma generate  
node scripts/seed-plans.js  
npm run dev  

---

## 🔑 Variables d’environnement

PAYPAL_CLIENT_ID=  
PAYPAL_CLIENT_SECRET=  
PAYPAL_MODE=sandbox  

CRON_SECRET=  

NEXT_PUBLIC_BASE_URL=

---

## 🧪 Tests

npm run test  
npm run test:e2e  

---

## 🔐 Sécurité

- Authentification sécurisée (NextAuth)  
- Protection des données (RGPD)  
- API sécurisée  
- Validation serveur  
- Gestion des tokens sécurisée  

---

## 📸 Aperçu

Prochainement

![Home](docs/home.png)

---


## 🌐 Démo

https://www.gl-hf.site  

---

## 📁 Structure

/app  
/components  
/lib  
/prisma  
/scripts  
/tests  

---

## 📄 Licence

Projet propriétaire – Tous droits réservés  

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre d’un projet Full Stack  

---

<p align="center">
  <b>GLHF — Good Luck Have Fun 🎮</b>
</p>
