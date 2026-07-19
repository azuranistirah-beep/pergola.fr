export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  date: string;
  gradient: string;
  author: { name: string; role: string };
  intro: string;
  sections: { title: string; body: string }[];
}

export const journalPosts: JournalPost[] = [
  {
    slug: "choisir-pergola-bioclimatique",
    title: "Choisir sa pergola bioclimatique : le guide complet 2026",
    excerpt:
      "Motorisation, lames orientables, capteurs pluie-vent : tout ce qu'il faut savoir avant de commander.",
    category: "Guide",
    readingMinutes: 8,
    date: "2026-03-12",
    gradient: "linear-gradient(140deg, #14100b, #c8a46b)",
    author: { name: "Camille Rivière", role: "Directrice studio" },
    intro:
      "La pergola bioclimatique est devenue le référent des structures d'extérieur haut de gamme. Voici les critères qui font vraiment la différence — et ceux qu'on peut ignorer.",
    sections: [
      {
        title: "Les lames orientables : le cœur du système",
        body: "L'ouverture jusqu'à 160° permet d'ajuster l'ombre, la ventilation et la protection à la lumière. Nous utilisons des lames en aluminium extrudé de 6 mm minimum, avec joints acoustiques pour éviter les vibrations par vent fort.",
      },
      {
        title: "Motorisation : Somfy io ou générique ?",
        body: "Somfy io reste le standard européen pour la fiabilité et l'écosystème (télécommande, appli, intégration domotique). Les motorisations génériques dépannent en entrée de gamme mais peinent au-delà de 5 ans d'usage intensif.",
      },
      {
        title: "Capteurs pluie-vent : investissement ou gadget ?",
        body: "Un capteur combiné coûte environ 300 € et évite les mauvaises surprises : il ferme automatiquement en cas d'averse, protège les lames sous rafales. À prévoir dès la commande — l'ajout après-coup double le prix.",
      },
      {
        title: "LED intégrées : blanc chaud ou RGBW ?",
        body: "Le blanc chaud 2700K reste notre recommandation pour un usage tous les soirs. Le RGBW ajoute une flexibilité créative (couleurs pour les fêtes) mais l'usage se limite souvent aux 3 premiers mois.",
      },
    ],
  },
  {
    slug: "cedre-vs-aluminium",
    title: "Cèdre massif ou aluminium : quel matériau pour votre projet ?",
    excerpt:
      "Deux univers, deux esthétiques, deux entretiens. Nos artisans comparent en détail.",
    category: "Matériaux",
    readingMinutes: 6,
    date: "2026-02-28",
    gradient: "linear-gradient(150deg, #3b2a1a, #a17a4b)",
    author: { name: "Marc Delaunay", role: "Chef d'atelier Vendée" },
    intro:
      "Le cèdre respire, l'aluminium tient. Chaque matériau a ses forces. Voici comment choisir sans regret.",
    sections: [
      {
        title: "Cèdre : le charme du vivant",
        body: "Notre cèdre PEFC vieillit en développant une patine argentée après 18 mois. Il absorbe la chaleur, laisse passer un peu de lumière filtrée, et son grain unique fait de chaque pergola une pièce singulière.",
      },
      {
        title: "Aluminium : la ligne pure",
        body: "L'aluminium extrudé thermolaqué offre des angles nets, une durabilité sans entretien, et une palette de 18 coloris RAL ou anodisés. C'est le choix des architectures contemporaines et des projets bioclimatiques.",
      },
      {
        title: "Entretien : ce qu'on vous dit rarement",
        body: "Le cèdre demande un saturateur tous les 3 ans si vous voulez conserver la teinte d'origine. L'aluminium se rince à l'eau savonneuse 1 à 2 fois par an. Aucun des deux ne nécessite de traitement lourd.",
      },
    ],
  },
  {
    slug: "installation-hiver",
    title: "Installer sa pergola en hiver : bonne ou mauvaise idée ?",
    excerpt:
      "Nos chefs de chantier lèvent le voile sur les avantages et les précautions à prendre.",
    category: "Pratique",
    readingMinutes: 4,
    date: "2026-02-14",
    gradient: "linear-gradient(160deg, #1e1e1e, #5a5a5a)",
    author: { name: "Sarah Colin", role: "Cheffe de chantier" },
    intro:
      "Contrairement aux idées reçues, l'hiver est souvent la meilleure saison pour installer votre pergola. Voici pourquoi — et les précautions à connaître.",
    sections: [
      {
        title: "Les délais raccourcissent",
        body: "Notre atelier travaille toute l'année, mais les demandes explosent au printemps. Commander entre novembre et février permet de bénéficier de délais courts (3-4 semaines) et d'une disponibilité maximale de nos poseurs.",
      },
      {
        title: "Les conditions techniques",
        body: "Nous posons jusqu'à -5°C sans problème. En cas de neige, nous décalons d'une demi-journée. La seule contre-indication : les fondations béton demandent 5°C minimum pendant 48h, ce qui reste rare dans le sud.",
      },
      {
        title: "Un printemps prêt à recevoir",
        body: "Poser en janvier, c'est profiter dès les premiers beaux jours d'avril sans attendre 6 semaines de délai. Nos clients hivernaux gagnent en moyenne 5 semaines de terrasse par saison.",
      },
    ],
  },
  {
    slug: "eclairage-led-perimetrique",
    title: "L'éclairage LED périmétrique : notre nouvelle signature",
    excerpt:
      "Blanc chaud ou RGBW pilotable, découvrez le module que nous avons développé.",
    category: "Nouveauté",
    readingMinutes: 3,
    date: "2026-01-30",
    gradient: "linear-gradient(150deg, #4d4335, #c8a46b)",
    author: { name: "Antoine Rivière", role: "Fondateur" },
    intro:
      "Après 18 mois de développement, nous lançons notre module LED périmétrique intégré : profil aluminium anodisé, diffuseur opale, IP65.",
    sections: [
      {
        title: "Une lumière homogène, jamais éblouissante",
        body: "Nous avons banni les LED ponctuelles : le bandeau linéaire à haute densité (128 LED/m) diffuse une lumière homogène, sans point chaud visible. Résultat : une ambiance salon, pas un projecteur.",
      },
      {
        title: "Intégration invisible",
        body: "Le module se glisse dans une gorge usinée sur les traverses. Aucun câble apparent, aucun spot en applique. Le montage prend 20 minutes en atelier, avant expédition.",
      },
      {
        title: "Pilotage domotique",
        body: "Compatible Somfy TaHoma, Apple HomeKit et Google Home. Programmations horaires, scènes personnalisées, et détection crépusculaire disponibles depuis l'appli.",
      },
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  journalPosts.find((p) => p.slug === slug);
