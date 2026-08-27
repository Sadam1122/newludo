# LUDO comprehensive development seed

Run:

```bash
npm run db:seed
```

The seeder uses deterministic CUID-compatible IDs and `upsert`. It does not
call `deleteMany`, reset the database, or remove non-seed content. Running it
again refreshes deterministic demo rows and keeps their schedules in the
future. Existing singleton content is retained; visibility flags and the
existing Delivery Order are enabled so their feature routes remain testable.

The known demo admin account is intentionally reset to the password below on
every run. Use this seeder only for development/test databases.

The script has a strict runtime guard: it exits before any database write when
`NODE_ENV=production` or when `DATABASE_URL` does not point to `localhost`,
`127.0.0.1`, or the IPv6 loopback address. There is no production override.

## Demo credentials

- Admin: `admin@ludo.local` / `AdminLudo123!`
- Gold member: `demo.gold` / `MemberLudo123!` (10% discount)
- Community member: `demo.community` / `MemberLudo123!` (5% discount)

## Covered features

- Site settings, Hero carousel, Location, FAQ, Brands, and Event/MICE
- Media Library and active video Gallery items
- Match cards for internal, WhatsApp, Vendor, Limited, Full Booked, and
  Currently Showing CTA states
- Every Event Template: Reguler Match, Nobar Community, Big Match, Super Big
  Match, Iftar 2027, Music, and Delivery Order
- Table types, minimum charges, available/selected/booked/paid/locked states
- Whole-table and per-seat packages, Delivery categories, sold-out menu state,
  and à-la-carte items
- Member discounts
- Pending, successful, failed, expired, and cancelled transaction examples

Gallery seed rows use up to three existing video files from `public/uploads`.
If the directory has no local videos, one public MDN CC0 sample video is used
as a development fallback so the autoplay feature remains testable.
