# Site M. Patachon — consignes pour Claude

Site vitrine statique (HTML/CSS/JS, pas de build) du restaurant de burgers M. Patachon à Rouen.
Ce dépôt GitHub est **la source unique** du site : chaque commit sur `main` est publié
automatiquement sur **m-patachon.fr** par Cloudflare (Workers, ~1 min). Pas d'autre étape.

## Règles de travail
- Toujours committer directement sur `main` (pas de branche ni de pull request), avec un message
  en français qui décrit la modif (ex. « Burger du moment : Le Mexichon »). Puis pousser.
- Modifs minimales et ciblées : ne pas reformater ni réécrire des fichiers entiers.
- Après chaque modif de texte visible, mettre à jour les traductions dans `i18n.js` (voir plus bas).
- Ne jamais toucher à l'action du formulaire Formspree (`https://formspree.io/f/mrewwvkl`).
- Répondre à l'utilisateur en français, ton simple, et lui dire que le site sera à jour en ~1 min.

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Accueil (à propos, restaurants, food truck, recrutement, Instagram) |
| `la-carte.html` | La carte + bloc « La recette du moment » (section `momo-feature`) |
| `food-truck.html` | Page événementiel + formulaire de devis (Formspree) |
| `mentions-legales.html` | Mentions légales |
| `styles.css`, `script.js` | Styles et interactions communs à toutes les pages |
| `i18n.js` | Traductions EN / ES / DE (clé = texte français exact) |
| `assets/` | Images (`assets/photos/`), icônes, polices, logos |
| `_redirects`, `_headers` | Redirections (/hors-les-murs → /food-truck) et cache |
| `.assetsignore` | Fichiers du dépôt à ne pas publier (dont ce CLAUDE.md) |

## Changer le burger du moment (demande la plus fréquente)
Dans `la-carte.html` :
1. Les données SEO en haut du fichier (bloc JSON-LD, `"name": "… (édition limitée)"`,
   `"description"`, `"price"` au format `"15.00"`).
2. La section `<!-- RECETTES DU MOMENT -->` : `alt` de l'image, `.momo-feature__name`,
   `.momo-feature__price` (format `15 €`), `.momo-feature__desc`, et les `<span>` de
   `.momo-feature__ings` (ingrédients courts).
3. Photo : remplacer `assets/photos/recette-moment.jpg` (portrait, idéalement 788×1400, < 300 Ko).
   Si l'utilisateur envoie une photo, la redimensionner/recadrer à ce format avant de l'enregistrer.
4. Dans `i18n.js` : remplacer, dans les 3 langues (EN, ES, DE), les entrées de l'ancienne
   description et des anciens ingrédients par les nouvelles (clé = texte FR exact, identique
   au HTML ; les `&amp;` du HTML s'écrivent `&` dans i18n.js).
Si le prix ou un ingrédient n'est pas précisé, demander à l'utilisateur avant de publier.

## Traductions (`i18n.js`)
Un dictionnaire par langue (`en`, `es`, `de`). La clé est le texte français exact affiché dans
la page, la valeur est la traduction. Tout texte ajouté/modifié en français doit avoir son
entrée dans les 3 langues, sinon il reste en français quand on change de langue.

## Charte
- Couleurs : marine `#13377D` (dominante), turquoise `#39C7CE` (accent), blanc, gris texte `#4C4C4C`.
- Titres en capitales (police Antarctican Headline), texte « machine à écrire » en mono.
- Boutons « pill » arrondis : classes `btn btn--white`, `btn btn--marine`, `btn btn--outline-white`.
- Ton : familier, tutoiement, punchy. Signatures : « C'est bon, c'est maison, c'est Patachon »,
  « Pas de blabla. Juste du bon. »

## Infos pratiques (source de vérité)
- Commander : https://bonne-nouvelle.marketplace.dood.com/fr
- Petit-Quevilly (rive gauche) : 7 Rue Hélène Boucher, 76100 Rouen — 09 53 45 91 93 — livraison, à emporter
- Rouen centre-ville (rive droite) : 66 Rue de la Vicomté, 76000 Rouen — 09 55 93 82 78 — sur place, livraison, à emporter
- Food truck / événementiel : 07 80 95 98 83 — devis sous 72h
- Recrutement : patacrew@m-patachon.fr — Instagram : @m.patachon
