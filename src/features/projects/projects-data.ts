export interface Project {
  slug: string;
  title: string;
  tag: string;
  year: number;
  location: string;
  gradient: string;
  hero: string;
  challenge: string;
  solution: string;
  numbers: [string, string][];
  materials: string[];
  span?: string;
}

export const projects: Project[] = [
  {
    slug: "villa-saint-tropez",
    title: "Villa contemporaine — Saint-Tropez",
    tag: "Résidentiel",
    year: 2025,
    location: "Var (83)",
    gradient: "linear-gradient(150deg, #d8d3c8 0%, #b7b0a1 55%, #83786a 100%)",
    hero: "Une pergola bioclimatique de 48 m² en aluminium anodisé bronze, adossée à une villa d'architecte face à la baie de Pampelonne.",
    challenge:
      "Créer une extension outdoor invisible depuis la mer, résistante aux embruns salins et aux mistrals de 130 km/h, avec un budget total ne dépassant pas 45 k€.",
    solution:
      "Structure bioclimatique 8×6 m avec double motorisation Somfy io, capteurs pluie-vent, LED périmétriques RGBW, panneaux vitrés coulissants sur 3 faces. Coloris bronze anodisé pour se fondre dans le décor.",
    numbers: [
      ["48 m²", "surface couverte"],
      ["130 km/h", "résistance vent"],
      ["8 semaines", "chantier complet"],
      ["42 k€", "budget final"],
    ],
    materials: [
      "Aluminium extrudé, anodisation bronze",
      "Vitrage coulissant 8 mm sécurit",
      "LED RGBW dimmable Casambi",
      "Fondation micropieux inox",
    ],
    span: "md:col-span-2 md:row-span-2",
  },
  {
    slug: "hotel-marais",
    title: "Hôtel particulier — Le Marais",
    tag: "Hôtellerie",
    year: 2025,
    location: "Paris 4ᵉ",
    gradient: "linear-gradient(155deg, #14100b 0%, #1c1a17 45%, #0f0d0a 100%)",
    hero: "Deux pergolas jumelles pour la terrasse d'un hôtel 5 étoiles, dans le respect strict des Bâtiments de France.",
    challenge:
      "Intégrer des pergolas contemporaines dans un patio classé, avec l'accord préalable de l'ABF. Résister au régime climatique parisien tout en préservant une esthétique noire mate.",
    solution:
      "Deux structures 4×4 m adossées, thermolaquage noir sablé RAL 9005, chevrons ajourés pour respecter le caractère patrimonial. Chauffages infrarouges intégrés pour l'usage hivernal.",
    numbers: [
      ["32 m²", "surface couverte"],
      ["2", "structures jumelles"],
      ["6 semaines", "chantier"],
      ["Classé ABF", "conformité"],
    ],
    materials: [
      "Acier galvanisé RAL 9005 sablé",
      "Chevrons ajourés cèdre teinté",
      "Chauffages infrarouges IP65 6 kW",
      "Fixation façade discrète, sabots noirs",
    ],
  },
  {
    slug: "restaurant-nice",
    title: "Le Bord de Mer — Nice",
    tag: "Restaurant",
    year: 2024,
    location: "Alpes-Maritimes (06)",
    gradient: "linear-gradient(145deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)",
    hero: "Extension de terrasse pour un restaurant étoilé de la Promenade des Anglais.",
    challenge:
      "Doubler la capacité de service en terrasse tout en garantissant confort acoustique et thermique aux 60 couverts. Structure démontable pour la saison basse.",
    solution:
      "Pergola bioclimatique 12×5 m avec lames orientables acoustiques (joints néoprène), zip screens moteur Somfy sur 3 faces, chauffage rayonnant intégré, LED blanc chaud tamisées.",
    numbers: [
      ["60", "couverts ajoutés"],
      ["12×5 m", "dimensions"],
      ["+180%", "chiffre d'affaires terrasse"],
      ["4 semaines", "délai express"],
    ],
    materials: [
      "Bioclimatique alu anthracite RAL 7016",
      "Zip screens Serge Ferrari toile Batyline",
      "Chauffages IR télécommandés zone",
      "Éclairage LED 2700K modulaire",
    ],
  },
  {
    slug: "piscine-bordeaux",
    title: "Villa piscine — Cap-Ferret",
    tag: "Bord de piscine",
    year: 2024,
    location: "Gironde (33)",
    gradient: "linear-gradient(160deg, #1e3a5f 0%, #4d7ba8 55%, #b8d4e3 100%)",
    hero: "Pergola bioclimatique 24 m² sur le pool-house d'une villa contemporaine face au bassin d'Arcachon.",
    challenge:
      "Créer un salon d'été autour de la piscine, exposé au vent d'ouest et aux embruns du bassin. Éclairage nocturne obligatoire pour l'usage soirée.",
    solution:
      "Pergola bioclimatique 6×4 m adossée au pool-house, coloris blanc pur pour refléter la lumière, motorisation Somfy io + capteur vent, LED RGBW pilotables depuis le smartphone.",
    numbers: [
      ["24 m²", "surface couverte"],
      ["6×4 m", "dimensions"],
      ["Anti-corrosion", "traitement embruns"],
      ["Somfy io", "domotique"],
    ],
    materials: [
      "Aluminium anodisé blanc anti-UV",
      "Motorisation Somfy io + wireless",
      "LED RGBW Casambi Bluetooth",
      "Sabots inox 316L anti-corrosion",
    ],
    span: "md:col-span-2",
  },
  {
    slug: "chalet-megeve",
    title: "Chalet familial — Megève",
    tag: "Résidentiel montagne",
    year: 2024,
    location: "Haute-Savoie (74)",
    gradient: "linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)",
    hero: "Pergola cèdre 20 m² pour un chalet familial à 1200 m d'altitude, résistante aux charges de neige.",
    challenge:
      "Concevoir une pergola tenant 300 kg/m² de neige, s'accordant avec l'architecture traditionnelle de Megève, et démontable pour l'inspection annuelle.",
    solution:
      "Structure en cèdre massif 145×145 mm, chevrons renforcés, sabots inox anti-neige, teinte grise vieillie. Panneaux d'intimité en aluminium découpé motif floral.",
    numbers: [
      ["300 kg/m²", "charge neige"],
      ["20 m²", "surface"],
      ["1200 m", "altitude"],
      ["Cèdre 145 mm", "section poteaux"],
    ],
    materials: [
      "Cèdre canadien 145×145 mm PEFC",
      "Sabots inox anti-neige surdimensionnés",
      "Teinte grise vieillie Osmo",
      "Panneaux découpés laser motif alpin",
    ],
  },
  {
    slug: "commerce-lyon",
    title: "Terrasse commerciale — Lyon",
    tag: "Commercial",
    year: 2023,
    location: "Rhône (69)",
    gradient: "linear-gradient(160deg, #2b2b2b 0%, #4a4a4a 55%, #7a7a7a 100%)",
    hero: "Cinq pergolas identiques pour la terrasse d'une brasserie du Vieux Lyon.",
    challenge:
      "Standardiser la production de 5 modules identiques dans les délais du chantier, avec démontage possible pour la fête des Lumières.",
    solution:
      "Cinq pergolas 3×3 m modulaires en acier RAL 9005 sablé, chauffages IR télécommandés, éclairage LED périmétrique blanc chaud. Système de fixation démontable en 30 minutes.",
    numbers: [
      ["5", "structures identiques"],
      ["45 m²", "surface totale"],
      ["30 min", "démontage unité"],
      ["+120%", "capacité terrasse"],
    ],
    materials: [
      "Acier galvanisé RAL 9005 sablé",
      "Chauffages IR télécommandés",
      "LED blanc chaud 2700K IP65",
      "Fixation platine amovible brevetée",
    ],
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
