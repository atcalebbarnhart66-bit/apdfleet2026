# Vehicle & Equipment Inspection Portal (Web + Supabase)

This is a React + Vite frontend that talks to your Supabase Postgres database.

## 1) Prereqs
- Node.js 18+ (recommended)

## 2) Configure env
Create a file named `.env.local` in the project root:

```
VITE_SUPABASE_URL=YOUR_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

(You can copy `.env.example`.)

## 3) Install + run locally
```
npm install
npm run dev
```

## 4) Deploy
### Vercel
- Import this repo
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Build command: `npm run build`
- Output dir: `dist`

### Cloudflare Pages
- Framework preset: Vite
- Build command: `npm run build`
- Build output: `dist`
- Add the same environment variables.

## Notes on security
- The "anon" key (publishable key) is safe to embed in the frontend **as long as** Row Level Security (RLS) policies are correct.
- If you currently allow public insert/delete, anyone who can access the site can delete records.
  - Recommended: enable Supabase Auth and restrict delete to supervisors.
