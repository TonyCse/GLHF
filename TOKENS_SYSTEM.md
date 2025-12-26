# Système de Tokens GLHF

## Vue d'ensemble

Le système de tokens GLHF permet aux utilisateurs de participer aux tournois en utilisant des tokens mensuels. Chaque participation coûte 1 token, et les tokens se réinitialisent automatiquement chaque mois.

## Fonctionnalités

### Gestion des Tokens
- **3 tokens gratuits** par mois pour tous les utilisateurs
- **Forfaits premium** : 5, 8, ou 30 tokens par mois
- **Reset mensuel automatique** : les tokens ne s'accumulent pas
- **Remboursement automatique** si l'utilisateur quitte un tournoi avant qu'il ne commence

### Plans Disponibles
1. **Plan Gratuit** : 3 tokens/mois - 0€
2. **Plan Bronze** : 5 tokens/mois - 5.99€
3. **Plan Argent** : 8 tokens/mois - 9.99€
4. **Plan Or** : 30 tokens/mois - 19.99€

## Configuration

### Variables d'environnement requises

```env
# PayPal (pour les paiements)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # ou live pour la production

# Cron job security
CRON_SECRET=your_random_secret_for_cron_jobs

# Base URL de l'application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Configuration Cron Job

#### Sur Vercel
Le fichier `vercel.json` est déjà configuré pour exécuter le reset mensuel automatiquement le 1er de chaque mois à minuit.

#### Sur d'autres plateformes
Configurez un cron job pour appeler :
```bash
# Chaque 1er du mois à 00:00
0 0 1 * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/reset-tokens
```

## API Endpoints

### Tokens
- `GET /api/user/tokens` - Récupère les informations de tokens de l'utilisateur connecté
- `POST /api/user/tokens` - Reset forcé des tokens (admin uniquement)

### Plans
- `GET /api/plans` - Liste tous les plans disponibles avec leurs fonctionnalités

### Paiements
- `POST /api/payment/subscribe` - Crée un abonnement PayPal ou active un plan gratuit
- `GET|POST /api/payment/success` - Confirme un paiement réussi
- `POST /api/payment/webhook` - Gère les webhooks PayPal

### Cron Jobs
- `GET /api/cron/reset-tokens` - Reset mensuel automatique des tokens
- `POST /api/cron/reset-tokens` - Reset forcé des tokens

## Logique Métier

### Participation aux Tournois
1. L'utilisateur clique "Rejoindre" sur un tournoi
2. Le système vérifie s'il a des tokens disponibles
3. Si oui, -1 token et ajout à la participation
4. Si non, message d'erreur avec suggestion d'upgrade

### Quitter un Tournoi
1. L'utilisateur clique "Quitter" sur un tournoi
2. Le système vérifie si le tournoi a commencé
3. Si le tournoi n'a pas commencé : remboursement du token
4. Si le tournoi a commencé : pas de remboursement

### Reset Mensuel
Le reset se fait automatiquement lors de la première interaction de l'utilisateur dans le nouveau mois, MAIS aussi via un cron job pour garantir la cohérence.

## Pages Utilisateur

### `/plan`
- Affichage de tous les forfaits disponibles
- Comparaison des fonctionnalités
- Boutons d'abonnement PayPal
- Affichage des tokens actuels si connecté

### `/profil`
- Affichage détaillé des tokens restants
- Historique des participations
- Gestion de l'abonnement

## Tests

Pour tester le système en local :

1. **Initialiser les plans** (déjà fait)
2. **Tester les tokens** :
   ```bash
   # Obtenir les tokens d'un utilisateur
   curl -H "Cookie: your-auth-cookie" http://localhost:3000/api/user/tokens
   ```
3. **Tester le reset manuel** :
   ```bash
   curl -X POST -H "Authorization: Bearer test" http://localhost:3000/api/cron/reset-tokens
   ```

## Sécurité

- Les webhooks PayPal doivent être vérifiés en production
- Les cron jobs nécessitent un secret d'authentification
- Les tokens sont liés à l'utilisateur et ne peuvent pas être transférés
- Validation côté serveur pour tous les appels API

## Monitoring

Surveillez :
- Les échecs de reset mensuel
- Les webhooks PayPal échoués
- Les utilisateurs avec des tokens négatifs (bug)
- Les abonnements expirés

## Dépannage

### Tokens non resetés
- Vérifiez que le cron job s'exécute correctement
- Appelez manuellement `/api/cron/reset-tokens` avec le bon secret

### Paiements échoués
- Vérifiez la configuration PayPal
- Consultez les logs des webhooks
- Vérifiez que l'utilisateur a bien reçu son plan premium

### Remboursements manqués
- Vérifiez que la date du tournoi est correctement définie
- Les tournois passés ne donnent pas droit à remboursement

