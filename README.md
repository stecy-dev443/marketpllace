# MIXD Marketplace

A modern, multi-category marketplace for physical goods, digital products, websites and apps, and freelance services.

## Stack

- React 19 + Vite
- Tailwind CSS 4 (with a custom responsive design system)
- Supabase Auth + Postgres (integration-ready)
- Lucide icons

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase project URL and publishable/anon key to `.env.local` to activate account registration and login.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/migrations/20261117000100_mixd_marketplace.sql`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your local environment and Vercel project settings.
4. In Supabase Auth, configure your site URL and allowed redirect URLs for local development and production.

The migration creates profiles and marketplace listings with row-level security. Profile roles (buyer, seller, both) are descriptive account preferences, not privileged authorization claims. Listing ownership is enforced with `auth.uid()`.

## Current milestone

- Responsive marketplace landing page and browse experience
- Search, category filters, price sorting and top-rated sorting
- Listing detail view and local favourites
- Buyer/seller signup and login UI wired to Supabase Auth when configured
- Database migration for profiles and seller-owned listings
- Sample listing data for the first product iteration

## Next milestones

- Persist listings and images with Supabase Storage
- Seller dashboard and listing creation/editing
- Buyer/seller messaging
- Checkout, payments and a transparent 10% platform fee
- Reviews, moderation, reporting and admin tools

## Security notes

Never expose Supabase service-role or secret keys in frontend environment variables. Configure RLS before exposing tables through the Data API. Do not treat user-editable profile metadata as authorization.
