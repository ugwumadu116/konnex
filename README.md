# Konnex CRM

Simple, powerful CRM built for African businesses. Part of the [RivrAfrica](https://rivrafrica.com) suite.

## Features

- 🔐 **Authentication** — Sign up, login, multi-tenant workspaces
- 👥 **Contacts** — Manage people with search, filter, and company links
- 🏢 **Companies** — Track organizations and their contacts/deals
- 📊 **Deals Pipeline** — Visual Kanban board with drag-and-drop
- 📝 **Activities** — Log calls, emails, meetings, notes on any contact or deal
- 📈 **Dashboard** — Pipeline value, deals won, activity feed at a glance
- 📱 **Mobile-responsive** — Works great on phones and tablets
- 🏗️ **Multi-tenant** — Each company gets their own isolated workspace

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** + PostgreSQL
- **NextAuth.js** (credentials auth)
- **Tailwind CSS** + custom components
- **@hello-pangea/dnd** for drag-and-drop

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Create database and run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

## Deployment (Coolify)

1. Push to GitHub
2. Create new app in Coolify from the repo
3. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. Coolify will build using the Dockerfile automatically
5. Point `konnex.rivrafrica.com` DNS to your server

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Public URL (e.g. `https://konnex.rivrafrica.com`) |

## License

MIT — Built by [RivrAfrica](https://rivrafrica.com)
