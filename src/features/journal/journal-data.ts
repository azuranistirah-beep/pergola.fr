export interface JournalPost {
  slug: string;
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  category: string;
  category_en: string;
  readingMinutes: number;
  date: string;
  gradient: string;
  author: { name: string; role: string; role_en: string };
  intro: string;
  intro_en: string;
  sections: { title: string; title_en: string; body: string; body_en: string }[];
}

export const journalPosts: JournalPost[] = [
  {
    slug: "choisir-pergola-bioclimatique",
    title: "Choisir sa pergola bioclimatique : le guide complet 2026",
    title_en: "Choosing a bioclimatic pergola: the complete 2026 guide",
    excerpt:
      "Motorisation, lames orientables, capteurs pluie-vent : tout ce qu'il faut savoir avant de commander.",
    excerpt_en:
      "Motorisation, louvered slats, rain-wind sensors: everything to know before ordering.",
    category: "Guide",
    category_en: "Guide",
    readingMinutes: 8,
    date: "2026-03-12",
    gradient: "linear-gradient(140deg, #14100b, #c8a46b)",
    author: {
      name: "Camille Rivière",
      role: "Directrice studio",
      role_en: "Studio director",
    },
    intro:
      "La pergola bioclimatique est devenue le référent des structures d'extérieur haut de gamme. Voici les critères qui font vraiment la différence — et ceux qu'on peut ignorer.",
    intro_en:
      "The bioclimatic pergola has become the benchmark for premium outdoor structures. Here are the criteria that actually make a difference — and the ones you can ignore.",
    sections: [
      {
        title: "Les lames orientables : le cœur du système",
        title_en: "The louvered slats: the heart of the system",
        body: "L'ouverture jusqu'à 160° permet d'ajuster l'ombre, la ventilation et la protection à la lumière. Nous utilisons des lames en aluminium extrudé de 6 mm minimum, avec joints acoustiques pour éviter les vibrations par vent fort.",
        body_en:
          "Opening up to 160° lets you tune shade, ventilation and light protection. We use extruded aluminium slats of at least 6 mm, with acoustic joints to prevent vibration under strong winds.",
      },
      {
        title: "Motorisation : Somfy io ou générique ?",
        title_en: "Motorisation: Somfy io or generic?",
        body: "Somfy io reste le standard européen pour la fiabilité et l'écosystème (télécommande, appli, intégration domotique). Les motorisations génériques dépannent en entrée de gamme mais peinent au-delà de 5 ans d'usage intensif.",
        body_en:
          "Somfy io remains the European standard for reliability and ecosystem (remote, app, home automation integration). Generic motors work at entry level but struggle beyond 5 years of intensive use.",
      },
      {
        title: "Capteurs pluie-vent : investissement ou gadget ?",
        title_en: "Rain-wind sensors: investment or gadget?",
        body: "Un capteur combiné coûte environ 300 € et évite les mauvaises surprises : il ferme automatiquement en cas d'averse, protège les lames sous rafales. À prévoir dès la commande — l'ajout après-coup double le prix.",
        body_en:
          "A combined sensor costs about €300 and avoids unpleasant surprises: it closes automatically during rain, protects the slats under gusts. Plan for it at order time — adding later doubles the price.",
      },
      {
        title: "LED intégrées : blanc chaud ou RGBW ?",
        title_en: "Integrated LED: warm white or RGBW?",
        body: "Le blanc chaud 2700K reste notre recommandation pour un usage tous les soirs. Le RGBW ajoute une flexibilité créative (couleurs pour les fêtes) mais l'usage se limite souvent aux 3 premiers mois.",
        body_en:
          "Warm white 2700K remains our recommendation for daily evening use. RGBW adds creative flexibility (colours for parties) but usage often stops after the first 3 months.",
      },
    ],
  },
  {
    slug: "cedre-vs-aluminium",
    title: "Cèdre massif ou aluminium : quel matériau pour votre projet ?",
    title_en: "Solid cedar or aluminium: which material for your project?",
    excerpt:
      "Deux univers, deux esthétiques, deux entretiens. Nos artisans comparent en détail.",
    excerpt_en:
      "Two worlds, two aesthetics, two maintenance profiles. Our craftspeople compare in detail.",
    category: "Matériaux",
    category_en: "Materials",
    readingMinutes: 6,
    date: "2026-02-28",
    gradient: "linear-gradient(150deg, #3b2a1a, #a17a4b)",
    author: {
      name: "Marc Delaunay",
      role: "Chef d'atelier Vendée",
      role_en: "Vendée workshop lead",
    },
    intro:
      "Le cèdre respire, l'aluminium tient. Chaque matériau a ses forces. Voici comment choisir sans regret.",
    intro_en:
      "Cedar breathes, aluminium holds. Each material has its strengths. Here's how to choose without regret.",
    sections: [
      {
        title: "Cèdre : le charme du vivant",
        title_en: "Cedar: the charm of the living",
        body: "Notre cèdre PEFC vieillit en développant une patine argentée après 18 mois. Il absorbe la chaleur, laisse passer un peu de lumière filtrée, et son grain unique fait de chaque pergola une pièce singulière.",
        body_en:
          "Our PEFC cedar develops a silver patina after 18 months. It absorbs heat, lets in some filtered light, and its unique grain makes every pergola a singular piece.",
      },
      {
        title: "Aluminium : la ligne pure",
        title_en: "Aluminium: the pure line",
        body: "L'aluminium extrudé thermolaqué offre des angles nets, une durabilité sans entretien, et une palette de 18 coloris RAL ou anodisés. C'est le choix des architectures contemporaines et des projets bioclimatiques.",
        body_en:
          "Thermo-lacquered extruded aluminium offers sharp angles, maintenance-free durability, and a palette of 18 RAL or anodised colours. It's the choice for contemporary architecture and bioclimatic projects.",
      },
      {
        title: "Entretien : ce qu'on vous dit rarement",
        title_en: "Maintenance: what you're rarely told",
        body: "Le cèdre demande un saturateur tous les 3 ans si vous voulez conserver la teinte d'origine. L'aluminium se rince à l'eau savonneuse 1 à 2 fois par an. Aucun des deux ne nécessite de traitement lourd.",
        body_en:
          "Cedar requires a saturator every 3 years to keep the original tone. Aluminium is rinsed with soapy water 1–2 times per year. Neither needs heavy treatment.",
      },
    ],
  },
  {
    slug: "installation-hiver",
    title: "Installer sa pergola en hiver : bonne ou mauvaise idée ?",
    title_en: "Installing a pergola in winter: good or bad idea?",
    excerpt:
      "Nos chefs de chantier lèvent le voile sur les avantages et les précautions à prendre.",
    excerpt_en:
      "Our site leads reveal the benefits and the precautions to take.",
    category: "Pratique",
    category_en: "Practical",
    readingMinutes: 4,
    date: "2026-02-14",
    gradient: "linear-gradient(160deg, #1e1e1e, #5a5a5a)",
    author: {
      name: "Sarah Colin",
      role: "Cheffe de chantier",
      role_en: "Site lead",
    },
    intro:
      "Contrairement aux idées reçues, l'hiver est souvent la meilleure saison pour installer votre pergola. Voici pourquoi — et les précautions à connaître.",
    intro_en:
      "Contrary to received wisdom, winter is often the best season to install your pergola. Here's why — and the precautions to know.",
    sections: [
      {
        title: "Les délais raccourcissent",
        title_en: "Lead times shrink",
        body: "Notre atelier travaille toute l'année, mais les demandes explosent au printemps. Commander entre novembre et février permet de bénéficier de délais courts (3-4 semaines) et d'une disponibilité maximale de nos poseurs.",
        body_en:
          "Our workshop runs year-round, but demand explodes in spring. Ordering between November and February gets you short lead times (3–4 weeks) and maximum availability from our installers.",
      },
      {
        title: "Les conditions techniques",
        title_en: "Technical conditions",
        body: "Nous posons jusqu'à -5°C sans problème. En cas de neige, nous décalons d'une demi-journée. La seule contre-indication : les fondations béton demandent 5°C minimum pendant 48h, ce qui reste rare dans le sud.",
        body_en:
          "We install down to -5°C without issue. In case of snow, we shift by half a day. The only contraindication: concrete foundations need at least 5°C for 48h, which stays rare in the south.",
      },
      {
        title: "Un printemps prêt à recevoir",
        title_en: "A spring ready to entertain",
        body: "Poser en janvier, c'est profiter dès les premiers beaux jours d'avril sans attendre 6 semaines de délai. Nos clients hivernaux gagnent en moyenne 5 semaines de terrasse par saison.",
        body_en:
          "Installing in January means enjoying the first warm April days without a 6-week wait. Our winter customers gain on average 5 weeks of terrace per season.",
      },
    ],
  },
  {
    slug: "eclairage-led-perimetrique",
    title: "L'éclairage LED périmétrique : notre nouvelle signature",
    title_en: "Perimeter LED lighting: our new signature",
    excerpt:
      "Blanc chaud ou RGBW pilotable, découvrez le module que nous avons développé.",
    excerpt_en:
      "Warm white or programmable RGBW, discover the module we developed.",
    category: "Nouveauté",
    category_en: "New",
    readingMinutes: 3,
    date: "2026-01-30",
    gradient: "linear-gradient(150deg, #4d4335, #c8a46b)",
    author: {
      name: "Antoine Rivière",
      role: "Fondateur",
      role_en: "Founder",
    },
    intro:
      "Après 18 mois de développement, nous lançons notre module LED périmétrique intégré : profil aluminium anodisé, diffuseur opale, IP65.",
    intro_en:
      "After 18 months of development, we launch our integrated perimeter LED module: anodised aluminium profile, opal diffuser, IP65.",
    sections: [
      {
        title: "Une lumière homogène, jamais éblouissante",
        title_en: "A uniform light, never dazzling",
        body: "Nous avons banni les LED ponctuelles : le bandeau linéaire à haute densité (128 LED/m) diffuse une lumière homogène, sans point chaud visible. Résultat : une ambiance salon, pas un projecteur.",
        body_en:
          "We banned spot LEDs: the high-density linear strip (128 LED/m) diffuses uniform light with no visible hot spot. Result: a living-room ambience, not a floodlight.",
      },
      {
        title: "Intégration invisible",
        title_en: "Invisible integration",
        body: "Le module se glisse dans une gorge usinée sur les traverses. Aucun câble apparent, aucun spot en applique. Le montage prend 20 minutes en atelier, avant expédition.",
        body_en:
          "The module slides into a machined groove on the beams. No visible cable, no surface-mounted spot. Assembly takes 20 minutes in the workshop, before shipping.",
      },
      {
        title: "Pilotage domotique",
        title_en: "Home automation control",
        body: "Compatible Somfy TaHoma, Apple HomeKit et Google Home. Programmations horaires, scènes personnalisées, et détection crépusculaire disponibles depuis l'appli.",
        body_en:
          "Compatible with Somfy TaHoma, Apple HomeKit and Google Home. Timers, custom scenes, and dusk detection available from the app.",
      },
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  journalPosts.find((p) => p.slug === slug);
