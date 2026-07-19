export interface Project {
  slug: string;
  title: string;
  title_en: string;
  tag: string;
  tag_en: string;
  year: number;
  location: string;
  gradient: string;
  hero: string;
  hero_en: string;
  challenge: string;
  challenge_en: string;
  solution: string;
  solution_en: string;
  numbers: [string, string, string][];
  materials: string[];
  materials_en: string[];
  span?: string;
}

export const projects: Project[] = [
  {
    slug: "villa-saint-tropez",
    title: "Villa contemporaine — Saint-Tropez",
    title_en: "Contemporary villa — Saint-Tropez",
    tag: "Résidentiel",
    tag_en: "Residential",
    year: 2025,
    location: "Var (83)",
    gradient: "linear-gradient(150deg, #d8d3c8 0%, #b7b0a1 55%, #83786a 100%)",
    hero: "Une pergola bioclimatique de 48 m² en aluminium anodisé bronze, adossée à une villa d'architecte face à la baie de Pampelonne.",
    hero_en:
      "A 48 m² bioclimatic pergola in bronze-anodised aluminium, wall-mounted to an architect villa facing Pampelonne bay.",
    challenge:
      "Créer une extension outdoor invisible depuis la mer, résistante aux embruns salins et aux mistrals de 130 km/h, avec un budget total ne dépassant pas 45 k€.",
    challenge_en:
      "Create an outdoor extension invisible from the sea, resistant to salt spray and 130 km/h mistral winds, within a €45k total budget.",
    solution:
      "Structure bioclimatique 8×6 m avec double motorisation Somfy io, capteurs pluie-vent, LED périmétriques RGBW, panneaux vitrés coulissants sur 3 faces. Coloris bronze anodisé pour se fondre dans le décor.",
    solution_en:
      "8×6 m bioclimatic structure with double Somfy io motorisation, rain-wind sensors, perimeter RGBW LED, sliding glass panels on 3 sides. Bronze-anodised colour to blend into the setting.",
    numbers: [
      ["48 m²", "surface couverte", "covered area"],
      ["130 km/h", "résistance vent", "wind resistance"],
      ["8 semaines", "chantier complet", "full build"],
      ["42 k€", "budget final", "final budget"],
    ],
    materials: [
      "Aluminium extrudé, anodisation bronze",
      "Vitrage coulissant 8 mm sécurit",
      "LED RGBW dimmable Casambi",
      "Fondation micropieux inox",
    ],
    materials_en: [
      "Extruded aluminium, bronze anodising",
      "8 mm safety sliding glass",
      "Casambi dimmable RGBW LED",
      "Stainless steel micropile foundation",
    ],
    span: "md:col-span-2 md:row-span-2",
  },
  {
    slug: "hotel-marais",
    title: "Hôtel particulier — Le Marais",
    title_en: "Townhouse hotel — Le Marais",
    tag: "Hôtellerie",
    tag_en: "Hospitality",
    year: 2025,
    location: "Paris 4ᵉ",
    gradient: "linear-gradient(155deg, #14100b 0%, #1c1a17 45%, #0f0d0a 100%)",
    hero: "Deux pergolas jumelles pour la terrasse d'un hôtel 5 étoiles, dans le respect strict des Bâtiments de France.",
    hero_en:
      "Two twin pergolas for the terrace of a 5-star hotel, respecting strict Bâtiments de France constraints.",
    challenge:
      "Intégrer des pergolas contemporaines dans un patio classé, avec l'accord préalable de l'ABF. Résister au régime climatique parisien tout en préservant une esthétique noire mate.",
    challenge_en:
      "Integrate contemporary pergolas into a listed patio, with prior approval from the Architecte des Bâtiments de France. Withstand Paris climate while preserving a matte black aesthetic.",
    solution:
      "Deux structures 4×4 m adossées, thermolaquage noir sablé RAL 9005, chevrons ajourés pour respecter le caractère patrimonial. Chauffages infrarouges intégrés pour l'usage hivernal.",
    solution_en:
      "Two 4×4 m wall-mounted structures, sandblasted black RAL 9005 thermo-lacquering, louvered rafters respecting heritage character. Integrated infrared heaters for winter use.",
    numbers: [
      ["32 m²", "surface couverte", "covered area"],
      ["2", "structures jumelles", "twin structures"],
      ["6 semaines", "chantier", "build"],
      ["Classé ABF", "conformité", "compliance"],
    ],
    materials: [
      "Acier galvanisé RAL 9005 sablé",
      "Chevrons ajourés cèdre teinté",
      "Chauffages infrarouges IP65 6 kW",
      "Fixation façade discrète, sabots noirs",
    ],
    materials_en: [
      "Sandblasted RAL 9005 galvanised steel",
      "Louvered stained cedar rafters",
      "IP65 infrared heaters 6 kW",
      "Discreet façade fixation, black brackets",
    ],
  },
  {
    slug: "restaurant-nice",
    title: "Le Bord de Mer — Nice",
    title_en: "Le Bord de Mer — Nice",
    tag: "Restaurant",
    tag_en: "Restaurant",
    year: 2024,
    location: "Alpes-Maritimes (06)",
    gradient: "linear-gradient(145deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)",
    hero: "Extension de terrasse pour un restaurant étoilé de la Promenade des Anglais.",
    hero_en: "Terrace extension for a Michelin-starred restaurant on the Promenade des Anglais.",
    challenge:
      "Doubler la capacité de service en terrasse tout en garantissant confort acoustique et thermique aux 60 couverts. Structure démontable pour la saison basse.",
    challenge_en:
      "Double the terrace service capacity while guaranteeing acoustic and thermal comfort for 60 covers. Removable structure for the low season.",
    solution:
      "Pergola bioclimatique 12×5 m avec lames orientables acoustiques (joints néoprène), zip screens moteur Somfy sur 3 faces, chauffage rayonnant intégré, LED blanc chaud tamisées.",
    solution_en:
      "12×5 m bioclimatic pergola with acoustic louvered slats (neoprene joints), Somfy motorised zip screens on 3 sides, integrated radiant heating, dimmed warm white LED.",
    numbers: [
      ["60", "couverts ajoutés", "extra covers"],
      ["12×5 m", "dimensions", "dimensions"],
      ["+180%", "chiffre d'affaires terrasse", "terrace revenue"],
      ["4 semaines", "délai express", "express delay"],
    ],
    materials: [
      "Bioclimatique alu anthracite RAL 7016",
      "Zip screens Serge Ferrari toile Batyline",
      "Chauffages IR télécommandés zone",
      "Éclairage LED 2700K modulaire",
    ],
    materials_en: [
      "Bioclimatic anthracite RAL 7016 aluminium",
      "Serge Ferrari Batyline zip screens",
      "Zoned remote-controlled IR heaters",
      "Modular 2700K LED lighting",
    ],
  },
  {
    slug: "piscine-bordeaux",
    title: "Villa piscine — Cap-Ferret",
    title_en: "Pool villa — Cap-Ferret",
    tag: "Bord de piscine",
    tag_en: "Poolside",
    year: 2024,
    location: "Gironde (33)",
    gradient: "linear-gradient(160deg, #1e3a5f 0%, #4d7ba8 55%, #b8d4e3 100%)",
    hero: "Pergola bioclimatique 24 m² sur le pool-house d'une villa contemporaine face au bassin d'Arcachon.",
    hero_en:
      "24 m² bioclimatic pergola on the pool-house of a contemporary villa facing the Arcachon basin.",
    challenge:
      "Créer un salon d'été autour de la piscine, exposé au vent d'ouest et aux embruns du bassin. Éclairage nocturne obligatoire pour l'usage soirée.",
    challenge_en:
      "Create a summer lounge around the pool, exposed to west wind and basin spray. Nighttime lighting mandatory for evening use.",
    solution:
      "Pergola bioclimatique 6×4 m adossée au pool-house, coloris blanc pur pour refléter la lumière, motorisation Somfy io + capteur vent, LED RGBW pilotables depuis le smartphone.",
    solution_en:
      "6×4 m bioclimatic pergola wall-mounted to the pool-house, pure white colour to reflect light, Somfy io motorisation + wind sensor, smartphone-controlled RGBW LED.",
    numbers: [
      ["24 m²", "surface couverte", "covered area"],
      ["6×4 m", "dimensions", "dimensions"],
      ["Anti-corrosion", "traitement embruns", "spray-proofing"],
      ["Somfy io", "domotique", "home automation"],
    ],
    materials: [
      "Aluminium anodisé blanc anti-UV",
      "Motorisation Somfy io + wireless",
      "LED RGBW Casambi Bluetooth",
      "Sabots inox 316L anti-corrosion",
    ],
    materials_en: [
      "White UV-proof anodised aluminium",
      "Somfy io wireless motorisation",
      "Casambi Bluetooth RGBW LED",
      "316L stainless steel anti-corrosion brackets",
    ],
    span: "md:col-span-2",
  },
  {
    slug: "chalet-megeve",
    title: "Chalet familial — Megève",
    title_en: "Family chalet — Megève",
    tag: "Résidentiel montagne",
    tag_en: "Mountain residential",
    year: 2024,
    location: "Haute-Savoie (74)",
    gradient: "linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)",
    hero: "Pergola cèdre 20 m² pour un chalet familial à 1200 m d'altitude, résistante aux charges de neige.",
    hero_en:
      "20 m² cedar pergola for a family chalet at 1200 m altitude, resistant to snow loads.",
    challenge:
      "Concevoir une pergola tenant 300 kg/m² de neige, s'accordant avec l'architecture traditionnelle de Megève, et démontable pour l'inspection annuelle.",
    challenge_en:
      "Design a pergola holding 300 kg/m² of snow, matching Megève's traditional architecture, and removable for annual inspection.",
    solution:
      "Structure en cèdre massif 145×145 mm, chevrons renforcés, sabots inox anti-neige, teinte grise vieillie. Panneaux d'intimité en aluminium découpé motif floral.",
    solution_en:
      "145×145 mm solid cedar structure, reinforced rafters, anti-snow stainless brackets, aged grey stain. Laser-cut aluminium privacy panels with floral motif.",
    numbers: [
      ["300 kg/m²", "charge neige", "snow load"],
      ["20 m²", "surface", "area"],
      ["1200 m", "altitude", "altitude"],
      ["Cèdre 145 mm", "section poteaux", "post section"],
    ],
    materials: [
      "Cèdre canadien 145×145 mm PEFC",
      "Sabots inox anti-neige surdimensionnés",
      "Teinte grise vieillie Osmo",
      "Panneaux découpés laser motif alpin",
    ],
    materials_en: [
      "145×145 mm PEFC Canadian cedar",
      "Oversized stainless anti-snow brackets",
      "Osmo aged grey stain",
      "Laser-cut alpine-motif panels",
    ],
  },
  {
    slug: "commerce-lyon",
    title: "Terrasse commerciale — Lyon",
    title_en: "Commercial terrace — Lyon",
    tag: "Commercial",
    tag_en: "Commercial",
    year: 2023,
    location: "Rhône (69)",
    gradient: "linear-gradient(160deg, #2b2b2b 0%, #4a4a4a 55%, #7a7a7a 100%)",
    hero: "Cinq pergolas identiques pour la terrasse d'une brasserie du Vieux Lyon.",
    hero_en: "Five identical pergolas for the terrace of a Vieux Lyon brasserie.",
    challenge:
      "Standardiser la production de 5 modules identiques dans les délais du chantier, avec démontage possible pour la fête des Lumières.",
    challenge_en:
      "Standardise the production of 5 identical modules within site delays, with removability for the Fête des Lumières.",
    solution:
      "Cinq pergolas 3×3 m modulaires en acier RAL 9005 sablé, chauffages IR télécommandés, éclairage LED périmétrique blanc chaud. Système de fixation démontable en 30 minutes.",
    solution_en:
      "Five 3×3 m modular pergolas in sandblasted RAL 9005 steel, remote-controlled IR heaters, warm white perimeter LED lighting. Fixation system removable in 30 minutes.",
    numbers: [
      ["5", "structures identiques", "identical structures"],
      ["45 m²", "surface totale", "total area"],
      ["30 min", "démontage unité", "unit removal"],
      ["+120%", "capacité terrasse", "terrace capacity"],
    ],
    materials: [
      "Acier galvanisé RAL 9005 sablé",
      "Chauffages IR télécommandés",
      "LED blanc chaud 2700K IP65",
      "Fixation platine amovible brevetée",
    ],
    materials_en: [
      "Sandblasted RAL 9005 galvanised steel",
      "Remote-controlled IR heaters",
      "IP65 2700K warm white LED",
      "Patented removable-plate fixation",
    ],
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
