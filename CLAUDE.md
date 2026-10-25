# CLAUDE.md — Spécification & Guide de Développement PWA Urgences Ziguinchor

Ce fichier sert de référence complète et d'instructions directes pour **Claude Code** (et tout développeur) afin de maintenir, déployer et faire évoluer la Progressive Web App (PWA) de contacts d'urgence et d'annuaire des services essentiels pour **Ziguinchor (Casamance, Sénégal)**.

---

## 1. Vue d'Ensemble du Projet

* **Nom du Projet** : Urgences Ziguinchor PWA (Féju Jamp Ziguinchor)
* **Localisation Cible** : Ziguinchor, Région de Casamance, République du Sénégal
* **Langues Supportées** :
  * **Français** (langue principale / officielle de l'administration et de la santé au Sénégal)
  * **Wolof** (langue nationale courante, bilinguisme complet avec commutateur dynamique)
* **Objectif Principal** : Fournir un accès instantané, fluide et 100 % utilisable hors-ligne aux numéros de téléphone d'urgence vitale, hôpitaux avec extensions de services (notamment l'Hôpital de la Paix), police, sapeurs-pompiers, fournisseurs de services essentiels (Senelec, SEN'EAU), pharmacies et administrations locales.

---

## 2. Stack Technique & Architecture

* **Framework UI** : React 19 (TypeScript, Hooks)
* **Bundler & Build Tool** : Vite 8
* **Styling** : Tailwind CSS v4 (`@import "tailwindcss";`, mobile-first, contrastes élevés)
* **Icônes** : Lucide React
* **PWA & Offline** : `vite-plugin-pwa` avec Workbox (`registerType: 'autoUpdate'`, Service Worker actif en développement et en production, `manifest.webmanifest`, icônes masquables 192x192 et 512x512)
* **Format de Données** : Typage TypeScript strict (`EmergencyContact`, `Department`, `CategoryId`, `Translations`) avec persistance dans des modules JSON / TS faciles à enrichir.

---

## 3. Structure des Fichiers

```
/
├── CLAUDE.md                     # Ce fichier de spécification pour Claude Code
├── index.html                    # Point d'entrée HTML avec balises PWA & iOS Safari
├── metadata.json                 # Métadonnées du projet
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript (types vite + PWA)
├── vite.config.ts                # Vite + Tailwind + VitePWA (manifest, Workbox)
├── eslint.config.js              # ESLint (typescript-eslint, react-hooks)
├── pwa-assets.config.ts          # Génération des icônes à partir de public/icon.svg
├── public/
│   ├── icon.svg                  # Icône source, ronde (bouclier secours rouge/or)
│   ├── favicon.ico
│   ├── apple-touch-icon.png      # 180x180 pour iOS Safari
│   ├── pwa-64x64.png / pwa-192x192.png / pwa-512x512.png # rouges jusqu’au bord
│   └── maskable-icon-512x512.png # Icône masquable Android, rouge jusqu’au bord (aucun fond blanc)
└── src/
    ├── main.tsx                  # Montage React + enregistrement du Service Worker
    ├── index.css                 # Import global Tailwind CSS
    ├── App.tsx                   # Page principale : appel SOS, recherche, filtres, liste
    ├── types/index.ts            # Interfaces TypeScript
    ├── data/contacts.ts          # Données initiales (seed) des contacts
    ├── data/categories.ts        # Catégories (libellés FR/WO, icône, couleur)
    ├── data/tags.ts              # Domaines de soins (tags transversaux, ex. Maternité)
    ├── data/translations.ts      # Dictionnaire bilingue Français / Wolof
    ├── hooks/useContacts.ts      # CRUD + persistance localStorage + import/export JSON
    ├── hooks/useAdminMode.ts     # Mode gestion (?admin=1 / ?admin=0), par appareil
    ├── hooks/usePWAInstall.ts    # Détection de l'installabilité PWA (Chrome + iOS)
    ├── hooks/useOnlineStatus.ts  # Surveillance du statut réseau / hors-ligne
    └── components/
        ├── Header.tsx            # En-tête, commutateur FR/WO, bouton d'installation
        ├── ContactCard.tsx       # Carte contact (appel, WhatsApp, services dépliables)
        ├── ContactForm.tsx       # Formulaire création / modification
        ├── DataMenu.tsx          # Export, import, restauration des données (mode gestion)
        ├── AddContactDialog.tsx  # « Ajouter » : contact personnel ou proposition par WhatsApp
        └── ReportNumberDialog.tsx # Signalement d’un numéro erroné par WhatsApp
```

Pour régénérer les icônes après modification de `public/icon.svg` : `npm run icons` (le script `scripts/flatten-icons.mjs` remplit ensuite en rouge les coins transparents des `pwa-*.png` et renomme `apple-touch-icon-180x180.png` en `apple-touch-icon.png`). Toutes les icônes PNG sont rouges jusqu’au bord, sans transparence, pour qu’aucun lanceur Android (Samsung compris) n’affiche de fond blanc.

---

## 3b. Gestion des Données (CRUD)

* **Contacts officiels** = ceux dont l’`id` figure dans `DEFAULT_CONTACTS` (`src/data/contacts.ts`, `isOfficial` dans `useContacts.ts`). **Contacts personnels** = tous les autres, créés par l’utilisateur et gardés seulement sur son appareil (badge bleu « Mon contact », filtre « Mes contacts », ni badge « Non vérifié » ni bouton de signalement).
* **Utilisateurs normaux** : les contacts officiels sont toujours repris du seed à chaque chargement, donc **toute modification du seed (nouveaux contacts, corrections, tags) arrive chez tous les utilisateurs** après redéploiement. Ils ne peuvent ni modifier ni supprimer les contacts officiels (pas de crayon ni de corbeille), et le menu « Données » est masqué. Le bouton « Ajouter » propose : ajouter à mes contacts (formulaire, local) ou **proposer un contact pour tous** (nom, numéro, quartier, remarque), envoyé par WhatsApp à `REPORT_WHATSAPP` avec un message en français.
* **Mode gestion** (mainteneur) : `https://urgences-ziguinchor.org/?admin=1` l’active sur l’appareil (clé `uz.admin`), `?admin=0` ou le bouton « Quitter » du bandeau noir le désactive. Ce n’est pas une protection (n’importe qui connaissant le lien peut l’activer, mais seulement chez lui). En mode gestion, tout est modifiable et le menu « Données » est visible ; les contacts officiels sont alors lus depuis `localStorage` (clé `uz.contacts.v1`) : les contacts ajoutés au seed arrivent automatiquement, les ids déjà vus sont mémorisés dans `uz.seedIds.v1` (un contact supprimé ne revient pas, un contact modifié dans le seed n’est pas mis à jour). **En quittant le mode gestion, les modifications locales des contacts officiels sont remplacées par le seed** : exporter avant.
* Chaque contact peut contenir des numéros secondaires et des **services (départements)** avec téléphone, poste, interlocuteur et description.
* `phoneRaw` est calculé automatiquement à partir de `phone` (`toPhoneRaw`).
* Le champ `verified` signale les numéros confirmés ; sinon la carte affiche « Non vérifié ».
* Menu « Données », **mode gestion** : **export JSON** de tous les contacts, **import JSON** (fusion par `id` ou remplacement complet), **restauration** des données d'origine. **Utilisateurs normaux** : « Sauvegarder mes contacts » (contacts personnels seulement, via le menu de partage du téléphone si disponible, sinon téléchargement) et « Importer mes contacts » (fusion, les contacts officiels du fichier sont ignorés).
* Dès qu’un contact personnel est enregistré ou importé, l’app demande au navigateur un stockage persistant (`navigator.storage.persist()`) pour éviter l’effacement automatique.
* Les données sont propres à chaque appareil et navigateur. Pour diffuser une liste mise à jour à tous les utilisateurs, intégrer le JSON exporté dans `src/data/contacts.ts` (avec des `id` lisibles) et redéployer.

* **Domaines de soins (tags)** : en plus de sa catégorie, un contact peut porter des tags (`tags`, définis dans `src/data/tags.ts`, type `TagId`). Ils s’affichent en badge rose sur la carte, se cochent dans le formulaire et forment une ligne de filtres « Soins » sous les catégories. Tags actuels : Maternité, Pédiatrie, Vaccination, Paludisme / Fièvre. Pour ajouter un tag : l’ajouter à `TagId` et à `TAGS`. Un tag ajouté dans le seed arrive chez tous les utilisateurs (sauf sur un appareil en mode gestion).
* **Signalement des numéros erronés** : uniquement à côté du numéro principal (les numéros secondaires et postes s’obtiennent via le standard), une icône ambre (`MessageSquareWarning`) ouvre un petit formulaire (numéro correct + remarque). Un contact sans numéro principal affiche à la place « Proposer un numéro », qui disparaît dès qu’un numéro est saisi. L’envoi ouvre WhatsApp vers `REPORT_WHATSAPP` (+221 78 431 02 51, dans `ReportNumberDialog.tsx`) avec un message en français pré-rempli (nom, id du contact, numéro concerné, numéro proposé). La correction se fait ensuite à la main dans `src/data/contacts.ts`.

---

## 4. Modèle de Données des Contacts (Extensible)

Chaque contact est typé selon l'interface `EmergencyContact` dans `src/types/index.ts` :

```ts
export interface EmergencyContact {
  id: string;
  nameFr: string;
  nameWo: string;
  category: CategoryId;
  phone: string;
  phoneRaw: string;
  shortCode?: string;
  emergencyPhone?: string;    // ligne du service d'urgence, second bouton rouge
  emergencyPhoneRaw?: string;
  secondaryPhones?: { labelFr: string; labelWo: string; phone: string; phoneRaw: string }[];
  isEmergency: boolean;
  is24_7: boolean;
  district: string;
  address: string;
  descriptionFr: string;
  descriptionWo: string;
  keywordsFr: string[];
  keywordsWo: string[];
  departments?: Department[];
  tags?: TagId[];           // domaines de soins (src/data/tags.ts), filtrables
  website?: string;
  whatsapp?: string;
  contactPerson?: string;   // interlocuteur
  notes?: string;           // sources, points à vérifier
  homeVisits?: boolean;     // visites à domicile : oui / non / absent = inconnu
  verified?: boolean;       // numéro confirmé par une source fiable
  updatedAt?: string;       // ISO, mis à jour à chaque enregistrement
}

export interface Department {
  id: string;
  nameFr: string;
  nameWo: string;
  phone?: string;
  phoneRaw?: string;
  extension?: string;
  contactPerson?: string;
  descriptionFr?: string;
}
```

---

## 5. Contacts Essentiels Inclus pour Ziguinchor

Recherche web du 18/10/2026. **Tous les numéros restent « Non vérifié »** jusqu'à confirmation manuelle ; les sources et contradictions sont dans le champ `notes` de chaque contact (`src/data/contacts.ts`).

1. **SAMU National** : 1515 (24h/24, gratuit)
1b. **Service d’urgence Hôpital de la Paix** : +221 77 611 35 01 et **Service d’urgence Hôpital Régional** : +221 77 023 67 48 (catégorie « Urgences », **vérifiés**). Ces numéros figurent aussi dans le champ `emergencyPhone` des fiches des deux hôpitaux, affiché en second bouton rouge « Service d’urgence » sous « Appeler ».
2. **Hôpital de la Paix** (Avenue Djignabo, Néma 2) : +221 33 991 98 00, avec ses services (urgences, pédiatrie & néonatologie, maternité, chirurgie, cardiologie, anesthésie-réanimation, maladies infectieuses, dermatologie, laboratoire & banque de sang)
3. **Hôpital Régional / CHR**, dit « Hôpital Silence » : +221 33 991 11 54 / 33 991 12 75 / 33 991 10 12
3b. **Hôpital Militaire / CMIA** (Camp militaire Georges Boissy, cité Somivat) : aucun numéro (garnison : 33 991 18 36)
3c. **Centre de Santé Silence** (Av. Émile Badiane) : +221 33 991 15 32
3d. **Postes de santé** (catégorie « Postes de santé », bouton bleu ciel) : Poste de Santé de Néma, dit « Hôpital Belge » : aucun numéro ; Poste de Santé de Diabir, aussi appelé « Maternité de Diabir » (Diabir-Soforal, derrière le mur de AMA) : +221 78 753 81 71, **vérifié**, pas de visite à domicile, tag Maternité
3e. **Dispensaire Lyndiane** (« Sœurs Lyndiane », à confirmer) : aucun numéro
4. **Sapeurs-Pompiers, 41e Compagnie** : 18 / +221 33 991 10 63 / GIS 4 : +221 33 991 31 00
5. **Police, Commissariat Central** (Rue Javelier) : 17 / +221 33 991 10 13 / 33 991 34 94 / 77 529 00 36
6. **Gendarmerie** : 800 00 20 20 (⚠ selon une source, numéro VBG) / +221 33 991 11 12
7. **Senelec** : +221 33 867 66 66 / 30 100 66 66 / agence 33 991 12 21
8. **SEN'EAU** : 800 00 11 11 / 33 839 37 54 / WhatsApp : +221 78 935 51 51
9g. **Service National de l’Hygiène** (catégorie « Administration », plus code HP69+5R4) : +221 33 991 11 48 (fiche Google Maps)
9. **Mairie de Ziguinchor** (catégorie « Administration », bouton d’appel bleu) : +221 33 991 10 65 / 33 991 11 65 (aucune source en ligne)
9b. **Dentistes** (catégorie « Dentistes », bouton turquoise) : Clinique Dentaire La Casamance (Cité Biagui 1) : +221 33 991 76 39 / 77 615 40 59 ; Cabinet Dr Mangane (Rue du Général de Gaulle) : aucun numéro ; Dental Castor : +221 77 266 16 74
9c. **Cabinets médicaux** (catégorie « Cabinets médicaux », bouton violet) : Cabinet médical Dr Simon Tendeng (Av. Gabriel Carvalho) : +221 33 991 13 85 ; Cabinet Médical Néma : 33 991 15 91 / 76 244 45 54 ; Dr Fatou Bintou Diouf (Rue Javelier) : 33 991 15 80 ; Le Souffle (Yamatogne) : 33 990 29 72 / 77 498 11 15
9e. **Soins paramédicaux** (catégorie « Soins paramédicaux », bouton vert citron) : Aris Badji (Castors) : 76 180 54 13 / 77 658 08 07 ; Assontena : 76 288 51 80 / 77 058 41 12
9f. **CCA, Centre Conseil pour Adolescents et Jeunes** (catégorie « Santé », Escale) : +221 77 640 82 37, gratuit, santé reproductive / mentale, violences (source : carterosesenegal.com)
9d. **Casa Urgences, plateau médical** (catégorie « Santé », marqué Urgence) : +221 33 991 53 28, à vérifier en priorité
10. **Pharmacies** : Alexandre Diadhiou, Rond Point, Léona, Colobane, de la Paix, Goumel, Boucotte, Néma, Tilène, Santhiaba, de l’Est, du Sud (numéros d'annuaires) ; du Stade, Soucoupapaye, de Kénia sans numéro. Koldoise et Kaoussoulaye retirées (elles sont à Kolda).

Chaque catégorie a sa propre couleur de bouton d’appel (`callButton` dans `src/data/categories.ts`). Le statut « Urgence » reste signalé par le badge et la bordure rouges de la carte.

Le champ `homeVisits` (« Visites à domicile » : Oui / Non / Inconnu dans le formulaire) est affiché en badge sur la carte. Il est inconnu pour tous les contacts du seed.

---

## 6. Commandes

```bash
npm run dev     # Serveur de développement
npm run build   # Build de production
npm run lint    # Lint
npm run preview # Prévisualiser le build (test PWA / hors-ligne)
npm run icons   # Régénérer les icônes PWA
```

---

## 7. Points Ouverts

* Tous les numéros du seed sont **non vérifiés** : à confirmer (recherche web ou saisie manuelle) avant diffusion.
* Les textes wolof (`translations.ts`, `categories.ts`, `contacts.ts`) sont à faire relire par un locuteur natif.
* Le formulaire d'édition est en français uniquement.
