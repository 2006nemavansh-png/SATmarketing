## SAT Marketing

Track which companies the team has already pitched, so nobody wastes time
re-pitching the same one.

- Enter your name once (saved on your device).
- Search a company before pitching — see who already pitched it and when.
- Log new pitches, which become instantly searchable for the rest of the team.

### Stack

Next.js (App Router) + Supabase (Postgres) for shared storage across the team.

### Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
