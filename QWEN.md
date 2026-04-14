# CS2 Portfolio Tracker (SkinMetrics)

## Project Overview

**CS2 Portfolio Tracker** (internal name: `skinmetrics`) is a Next.js web application for tracking CS2 (Counter-Strike 2) item portfolios. Users can add CS2 items (knives, cases, skins, stickers, charms, etc.) to their portfolio, track price changes over time, and view investment performance through charts and statistics.

### Key Features
- Portfolio dashboard with overview statistics
- Price tracking (24h, 7d, 30d changes)
- Historical portfolio value charts (via Recharts)
- Best/worst performing items
- User authentication (via NextAuth.js)
- SQLite database with Prisma ORM
- Dark-themed UI (slate color palette)

### Tech Stack
| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Lucide React icons, custom components |
| Database | SQLite |
| ORM | Prisma |
| Auth | NextAuth.js |
| State Management | Zustand (listed in deps, but current store uses Context API + useReducer; Zustand planned for future migration) |
| Charts | Recharts |
| Date Utility | date-fns |
| Linting | ESLint 9 |

## Project Structure

```
cs2-portfolio/
├── prisma/
│   ├── schema.prisma          # Database schema (User, PortfolioItem, PriceHistory)
│   └── migrations/            # Prisma migration files
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   └── page.tsx           # Home/dashboard page
│   ├── components/
│   │   ├── layout/            # Header, etc.
│   │   ├── dashboard/         # PortfolioOverview, PortfolioChart, BestWorstItems
│   │   ├── items/             # ItemsTable, AddItemModal
│   │   └── ui/                # Reusable UI components (Button, etc.)
│   ├── lib/                   # Utility functions, API calls
│   └── store/                 # Zustand state stores (portfolioStore)
├── public/                    # Static assets
├── next.config.mjs            # Next.js config (image patterns, standalone output)
├── prisma.config.ts           # Prisma configuration
├── tsconfig.json              # TypeScript config (paths: @/* → src/*)
└── eslint.config.mjs          # ESLint config
```

### Database Models
- **User** — email, password, currency preference (RUB/USD/EUR)
- **PortfolioItem** — item name, category, holdings, buy price, current price, price changes
- **PriceHistory** — historical snapshots of portfolio value

## Building and Running

### Prerequisites
```bash
npm install
```

### Development
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
npm run start
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (GUI)
npx prisma studio
```

### Linting
```bash
npm run lint
```

## Development Conventions

- **Path aliases**: Use `@/*` to import from `src/*` (e.g., `@/components/ui/Button`)
- **Server/Client components**: Pages use `'use client'` directive for client-side rendering; SSR is enabled via `output: 'standalone'`
- **Styling**: Tailwind CSS utility classes with slate dark theme palette
- **TypeScript**: Strict mode enabled
- **State**: Zustand for client-side state management

## Environment Variables

The project uses `dotenv` for configuration. Expected `.env` variables:
- `DATABASE_URL` — SQLite database path (default: `file:./prisma/dev.db`)
- NextAuth-related variables for authentication

## Notes

- Images are allowed from `community.cloudflare.steamstatic.com` (Next.js image config)
- The project uses Next.js 14 — consult `node_modules/next/dist/docs/` for API details as this version has breaking changes from earlier versions
