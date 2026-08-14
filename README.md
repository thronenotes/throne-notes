# Throne Notes

**The First Prophetic Workspace Built for Kingdom Builders**

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
copy .env.local.example .env.local
# Edit .env.local with your Neon database URL

# 3. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS 3.4** — Dark kingly theme
- **Neon** — Serverless PostgreSQL (via Drizzle ORM)
- **OpenAI** — Whisper voice-to-text (optional)

## Features (Phase 1)

- **Scribe Studio** — Book writing with sermon mode, numerology sidebar, scripture panel
- **Dream Vault** — Journal with prophetic tags, spiritual states, audio recording UI
- **Blueprint Engine** — Life Path, Expression, Soul Urge, Personal Year/Month/Day

## Database Setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `.env.local` as `DATABASE_URL`
3. Push the schema:
   ```bash
   npm run db:push
   ```

## Next Steps

1. Add user authentication (Clerk, Auth.js, or custom)
2. Wire database CRUD for books, chapters, journal entries
3. Add OpenAI Whisper for voice transcription
4. Build export engine (PDF/ePub)
