# Pergola FR

Premium ecommerce for pergolas, gazebos, carports and outdoor structures — French market.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- Prisma + MySQL (Hostinger)
- Auth.js (v5)
- next-intl (FR default, EN)
- Framer Motion, GSAP (selective), Swiper, Lucide, shadcn/ui
- Zod, React Hook Form

## Getting started

```bash
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

Open http://localhost:3000

## Structure

```
src/
  app/[locale]/     # i18n routes (fr default, en)
  app/api/          # Route handlers
  components/       # Global UI primitives
  features/         # Feature modules (products, configurator, checkout, admin, ...)
  hooks/            # Reusable hooks
  services/         # Domain services
  repositories/     # Data access
  actions/          # Server actions
  lib/              # Framework glue (prisma client, utils, ...)
  i18n/             # next-intl config
  messages/         # Translations (fr.json, en.json)
prisma/
  schema.prisma     # Data model (Tahap 3)
```

## Roadmap

Built in stages. Current: **Tahap 2 (scaffold + folder structure)**.
