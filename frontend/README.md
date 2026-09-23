# The Hot Reports — Frontend

Next.js 15 (App Router) + TypeScript + TailwindCSS frontend for the The Hot Reports news and stories platform.

## Features

- 📰 Dynamic news articles with categories, search, and filtering
- 📖 Serial stories with episodes, likes, comments, and share tracking
- 🏔️ Tourism listings showcase
- 💼 Live advertising system (banner, sidebar, mid-content)
- 🌙 Dark mode support
- 📱 Fully responsive mobile-first design
- ⚡ Server-side rendering & static generation (SSR + SSG hybrid)
- 🔍 SEO optimized with JSON-LD structured data, Open Graph, Twitter Cards
- �️ Dynamic sitemap (articles, stories, categories, tourism, authors)
- �📊 Article view & read-completion tracking
- 📧 Newsletter subscription
- 💬 Contact form
- 🔔 Web Push notification support

## Quick Start

```powershell
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1" > .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Build for Production

```powershell
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout (fonts, theme)
│   ├── sitemap.ts          # Dynamic sitemap generation
│   ├── robots.ts           # robots.txt
│   ├── article/[slug]/     # Article detail page
│   ├── author/[slug]/      # Story author profile page
│   ├── category/[slug]/    # Category listing page
│   ├── contact/            # Contact form page
│   ├── about/              # About us page
│   ├── privacy/            # Privacy policy page
│   ├── stories/            # Stories listing page
│   │   ├── [slug]/         # Story series detail page
│   │   └── episode/[slug]/ # Story episode detail page
│   └── tourism/            # Tourism listings + detail pages
├── components/             # Shared React components
├── lib/                    # API client & utilities
│   ├── api.ts              # All API fetch functions
│   └── utils.ts            # Helpers
├── data/                   # TypeScript interfaces (data.ts)
└── public/                 # Static assets
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — featured articles, breaking news, ad slots |
| `/article/[slug]` | Article detail with view/read tracking, related articles |
| `/category/[slug]` | Category listing with search and pagination |
| `/stories` | Stories listing with genre filter and search |
| `/stories/[slug]` | Story series detail with episode list and story author card |
| `/stories/episode/[slug]` | Episode detail with likes, comments, shares |
| `/author/[slug]` | Story author profile with their series |
| `/tourism` | Tourism listings with type filter |
| `/about` | About page with team members and site stats |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Fonts**: Inter (sans-serif), Merriweather (serif)
- **API**: Django REST Framework backend (`NEXT_PUBLIC_API_BASE_URL`)
