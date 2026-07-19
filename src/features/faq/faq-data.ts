export interface FaqItem {
  q: string;
  q_en: string;
  a: string;
  a_en: string;
}

export interface FaqGroup {
  key: "before" | "order" | "delivery" | "warranty";
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    key: "before",
    items: [
      {
        q: "Puis-je visiter votre showroom avant de commander ?",
        q_en: "Can I visit your showroom before ordering?",
        a: "Oui, notre showroom du Marais (75004 Paris) est ouvert du mardi au samedi. Vous pouvez prendre rendez-vous depuis notre page contact — un conseiller vous reçoit avec les matières, les nuanciers et une démonstration du configurateur.",
        a_en:
          "Yes, our Marais showroom (75004 Paris) is open Tuesday to Saturday. You can book from our contact page — an advisor welcomes you with materials, colour charts and a configurator demo.",
      },
      {
        q: "Comment fonctionne le configurateur ?",
        q_en: "How does the configurator work?",
        a: "Chaque choix (dimensions, coloris, motorisation, LED, zip screen) recalcule instantanément le prix, la référence SKU et l'aperçu 3D. À la fin, vous pouvez ajouter au panier, demander un devis PDF ou prendre rendez-vous avec un conseiller.",
        a_en:
          "Every choice (dimensions, colours, motorisation, LED, zip screen) instantly recalculates price, SKU reference and 3D preview. At the end you can add to cart, request a PDF quote or book with an advisor.",
      },
      {
        q: "Proposez-vous des devis gratuits ?",
        q_en: "Do you offer free quotes?",
        a: "Oui, tout devis est gratuit et sans engagement. Le bureau d'études revient vers vous sous 48h ouvrées avec une proposition chiffrée et un plan technique.",
        a_en:
          "Yes, every quote is free and non-binding. Our engineering team comes back within 48 working hours with a costed proposal and a technical plan.",
      },
    ],
  },
  {
    key: "order",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        q_en: "Which payment methods do you accept?",
        a: "Carte bancaire (Visa, Mastercard, Amex) via Stripe, PayPal, virement SEPA. Le paiement en 3× sans frais est disponible dès 300 € via notre partenaire.",
        a_en:
          "Bank card (Visa, Mastercard, Amex) via Stripe, PayPal, SEPA transfer. Interest-free 3-instalment payment is available over €300 via our partner.",
      },
      {
        q: "Mes coordonnées bancaires sont-elles sécurisées ?",
        q_en: "Are my banking details secure?",
        a: "Oui. Nous ne stockons aucune donnée bancaire — toutes les transactions passent par les infrastructures certifiées PCI-DSS de nos partenaires (Stripe, PayPal).",
        a_en:
          "Yes. We store no banking data — every transaction goes through PCI-DSS-certified infrastructure from our partners (Stripe, PayPal).",
      },
      {
        q: "Puis-je annuler ma commande après paiement ?",
        q_en: "Can I cancel my order after payment?",
        a: "Vous disposez de 14 jours de rétractation pour les produits standard. Les configurations sur-mesure ne sont pas rétractables une fois validées par notre bureau d'études (48h ouvrées après commande).",
        a_en:
          "You have 14 days of withdrawal for standard products. Custom configurations are non-refundable once validated by our engineering team (48 working hours after order).",
      },
    ],
  },
  {
    key: "delivery",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        q_en: "What are the delivery lead times?",
        a: "4 à 6 semaines pour une commande standard, 3 semaines en express (+299 €). Le délai commence à la validation du bureau d'études pour les configurations sur-mesure.",
        a_en:
          "4 to 6 weeks for a standard order, 3 weeks in express (+€299). Lead time starts at engineering validation for custom configurations.",
      },
      {
        q: "Livrez-vous partout en France ?",
        q_en: "Do you deliver everywhere in France?",
        a: "Oui, en France métropolitaine (livraison offerte dès 2 000 €). Nous livrons également en Belgique, au Luxembourg, en Suisse et dans les DOM-TOM sur devis.",
        a_en:
          "Yes, throughout mainland France (free shipping over €2,000). We also deliver to Belgium, Luxembourg, Switzerland and French overseas territories on quote.",
      },
      {
        q: "Faites-vous la pose ?",
        q_en: "Do you install?",
        a: "Oui, l'option « pose par nos équipes » démarre à 1 490 €. Nos installateurs sont formés en usine et interviennent sur RDV. Pour la version standard, le kit est livré prêt à poser avec notice illustrée et accès vidéo YouTube.",
        a_en:
          "Yes, the 'install by our team' option starts at €1,490. Our installers are factory-trained and come by appointment. For the standard version, the kit ships ready to install with an illustrated manual and YouTube video access.",
      },
      {
        q: "Ai-je besoin d'une dalle béton ?",
        q_en: "Do I need a concrete slab?",
        a: "Pas systématiquement. Nos pergolas se fixent sur sol dur existant (dalle, terrasse, pavés). Pour les grands formats, nous conseillons 4 plots béton scellés (option disponible). Une dalle complète est proposée pour les projets clef en main.",
        a_en:
          "Not systematically. Our pergolas fix onto existing hard ground (slab, terrace, pavers). For large formats we recommend 4 sealed concrete pads (available as an option). A full slab is offered for turnkey projects.",
      },
    ],
  },
  {
    key: "warranty",
    items: [
      {
        q: "Quelle est la durée de la garantie ?",
        q_en: "How long is the warranty?",
        a: "10 ans sur la structure porteuse, 5 ans sur les motorisations, LED et finitions Qualicoat, 2 ans sur les accessoires. Détails complets sur notre page Garantie.",
        a_en:
          "10 years on the load-bearing structure, 5 years on motors, LED and Qualicoat finishes, 2 years on accessories. Full details on our Warranty page.",
      },
      {
        q: "Comment entretenir ma pergola ?",
        q_en: "How do I maintain my pergola?",
        a: "Un nettoyage 1 à 2 fois par an à l'eau tiède savonneuse suffit. Évitez les produits abrasifs et les nettoyeurs haute pression sur les finitions thermolaquées. Un rendez-vous d'inspection annuel est offert la première année.",
        a_en:
          "Cleaning 1 to 2 times a year with warm soapy water is enough. Avoid abrasive products and pressure washers on thermo-lacquered finishes. An annual inspection appointment is offered the first year.",
      },
      {
        q: "Que faire en cas de panne ?",
        q_en: "What to do in case of failure?",
        a: "Contactez votre chef de studio (indiqué sur votre bon de livraison) ou notre hotline. Diagnostic à distance sous 24h ouvrées, intervention sur site sous 72h en France métropolitaine.",
        a_en:
          "Contact your studio lead (listed on your delivery note) or our hotline. Remote diagnosis within 24 working hours, on-site intervention within 72 hours in mainland France.",
      },
    ],
  },
];
