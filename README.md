# The Hot Reports

**Nationwide news for Uganda** - A modern, full-stack news and storytelling platform delivering accurate, timely, and impactful news coverage alongside captivating serial stories from the country and beyond.

## 🌟 Overview

The Hot Reports is a professional news and stories website built with modern web technologies, featuring:

- 📰 **News Management**: Full-featured CMS with editorial workflows
- 📖 **Serial Stories**: Dedicated stories section with episodes, likes, comments, and share tracking
- 💼 **Advertising System**: Complete ad management with slot targeting and click/impression analytics
- 🏔️ **Tourism Showcase**: Travel listings from across Uganda
- 👥 **Role-Based Access**: Superadmin, Editor, Reporter, Story Writer, and Ads Manager roles
- 📊 **Analytics**: Article & story views, likes, comments, share tracking
- 📱 **Mobile-First**: Responsive design for all devices
- 🌙 **Dark Mode**: Full dark mode support
- 🔍 **SEO Optimized**: Structured data, meta tags, sitemaps
- 🔔 **Push Notifications**: Web Push (VAPID) support

## 🏗️ Architecture

### Backend (Django 6.0)
- **Framework**: Django + Django REST Framework
- **Database**: SQLite (production-ready with proper indexing)
- **Authentication**: JWT (SimpleJWT)
- **API Docs**: OpenAPI/Swagger via drf-spectacular
- **Admin**: Custom role-based admin interface (5 role views)
- **Media**: Server-hosted image uploads (Pillow, WebP processing)
- **Push**: Web Push via pywebpush + VAPID

### Frontend (Next.js 15)
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Rendering**: SSR + SSG hybrid
- **Icons**: Lucide React
- **Fonts**: Inter + Merriweather

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py setup_categories        # 12 default news categories
python manage.py setup_ad_slots          # 8 ad slot positions
python manage.py create_default_users --insecure  # 5 default users (dev only)
python manage.py runserver
```

✅ Backend: `http://127.0.0.1:8000`  
🔐 Admin: `http://127.0.0.1:8000/admin/`  
📚 API Docs: `http://127.0.0.1:8000/api/docs/`

### Frontend Setup

```powershell
cd frontend
npm install
# Create frontend/.env.local:
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
# NEXT_PUBLIC_EMAIL=info@thehotreports.com
# NEXT_PUBLIC_ADS_EMAIL=ads@thehotreports.com
npm run dev
```

✅ Frontend: `http://localhost:3000`

### Production Deployment

**Backend:** Render (https://render.com) - See `DEPLOYMENT.md`  
**Frontend:** Vercel (https://vercel.com) - See `DEPLOYMENT.md`

## 📁 Project Structure

```
the-hot-reports/
├── backend/
│   ├── accounts/          # User auth, profiles, JWT
│   ├── ads/               # Ad slots, ads, impression/click tracking
│   ├── news/              # Articles, stories, categories, comments, analytics
│   ├── tourism/           # Tourism listings
│   ├── pulse/             # Django settings, admin site, URL routing
│   ├── common/            # Shared utilities
│   ├── templates/         # Django HTML templates (admin)
│   ├── static/            # Static files
│   └── tests/             # Pytest test suite
├── frontend/
│   ├── app/               # Next.js App Router pages
│   │   ├── article/       # Article detail pages
│   │   ├── author/        # Story author profile pages
│   │   ├── category/      # Category listing pages
│   │   ├── stories/       # Stories listing, series detail, episode pages
│   │   └── tourism/       # Tourism listing pages
│   ├── components/        # Shared React components
│   ├── lib/               # API client & utilities
│   ├── data/              # TypeScript interfaces
│   └── public/            # Static assets
├── README.md              # This file
├── USER_GUIDE.md          # User guide for content management
├── QUICKSTART.md          # 10-minute setup guide
└── DEPLOYMENT.md          # Production & deployment guide
```

## 👥 User Roles & Permissions

| Role | Email | Access |
|------|-------|--------|
| **Superadmin** | admin@thehotreports.com | Full system access, all models, user management |
| **Editor** | editor@thehotreports.com | Articles (full), categories, tourism, stories (view/delete), comment moderation |
| **Reporter** | reporter@thehotreports.com | Create/edit own articles; author auto-set; draft-only |
| **Story Writer** | stories@thehotreports.com | Create/edit own stories; author auto-set; draft-only |
| **Ads Manager** | ads@thehotreports.com | Create tourism listings; created_by auto-set; draft-only |

> **Note:** Storywriters and Editors can create/edit stories. Storywriters can only save as Draft and must have Editor approval to publish.

## 🔑 Key Features

### News System
- Multi-category articles with featured, breaking, and trending flags
- Rich text content with image uploads
- SEO metadata (meta title, description, keywords)
- Related articles (by category + tags)
- View tracking with unique visitor deduplication
- Scheduled publishing via `publish_scheduled` management command
- Article likes, shares, comments

### Serial Stories System
- Story Series with genres, cover images, and episode listings
- Story Episodes with rich content, images, and reading time estimates
- Per-episode engagement: views, likes (toggle by IP), comments (moderated), shares
- Share tracking by platform (Facebook, WhatsApp, Twitter, copy)
- Story analytics dashboard in admin

### Advertising
- 8 configurable ad slots (homepage banner/sidebar, Article Bottom/mid/sidebar, category/stories/tourism sidebars)
- Impression and click tracking per ad
- Active/inactive scheduling by date
- Fallback house ads

### Tourism
- Listings with type (safari, lodge, hotel, campsite, experience)
- Featured listings, search & filtering
- Rich descriptions and contact info

### Admin Dashboard
- Role-specific dashboards with KPI cards
- 30-day article & story analytics charts
- Quick action links per role
- Story stats: series, episodes, views, likes, comments, shares
- Mobile-responsive, dark mode

## 📊 API Reference

All JSON responses use **camelCase** (djangorestframework-camel-case).  
Full interactive docs: `http://127.0.0.1:8000/api/docs/`

### News & Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories/` | All categories |
| GET | `/api/v1/articles/` | Articles list (`?category=&search=&featured=&breaking=&trending=&tag=&page=&page_size=`) |
| GET | `/api/v1/articles/{slug}/` | Article detail |
| GET | `/api/v1/articles/{slug}/related/?limit=4` | Related articles |
| GET | `/api/v1/articles/statistics/` | Site statistics (total articles, views, readers) |
| POST | `/api/v1/articles/{slug}/view/` | Track article view event |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stories/series/` | Story series list (`?genre=&status=&is_featured=&search=&ordering=`) |
| GET | `/api/v1/stories/series/{slug}/` | Series detail (includes episode list) |
| GET | `/api/v1/stories/series/{slug}/episodes/` | All episodes for a series |
| GET | `/api/v1/stories/series/genres/` | Available genres |
| GET | `/api/v1/stories/series/by-author/?author={slug}` | Series by story author |
| GET | `/api/v1/stories/episodes/{slug}/` | Episode detail |
| POST | `/api/v1/stories/episodes/{slug}/comment/` | Submit comment (pending approval) |
| POST | `/api/v1/stories/episodes/{slug}/like/` | Toggle like (IP-based) |
| POST | `/api/v1/stories/episodes/{slug}/share/` | Track share (`platform`: facebook/whatsapp/twitter/copy) |
| POST | `/api/v1/stories/episodes/{slug}/track-view/` | Track view event |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Register user |
| POST | `/api/v1/auth/login/` | JWT login → `{ access, refresh }` |
| POST | `/api/v1/auth/refresh/` | Refresh access token |
| GET | `/api/v1/auth/me/` | Current user profile (Bearer token) |
| PATCH | `/api/v1/auth/me/` | Update profile (supports multipart for avatar) |
| POST | `/api/v1/auth/password/change/` | Change password |

### Tourism
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tourism/` | Tourism listings (`?type=&featured=&search=`) |
| GET | `/api/v1/tourism/{slug}/` | Single listing detail |

### Ads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ads/serve/{slot_key}/` | Serve active ad for slot |
| POST | `/api/v1/ads/click/{ad_id}/` | Track ad click |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/newsletter/subscribe/` | Subscribe to newsletter `{ email }` |
| POST | `/api/v1/contact/` | Submit contact form `{ name, email, subject, phone, message }` |
| GET | `/api/v1/push/vapid-public-key/` | Get VAPID public key |
| POST | `/api/v1/push/subscribe/` | Subscribe to push notifications |
| POST | `/api/v1/push/unsubscribe/` | Unsubscribe from push notifications |
| GET | `/api/v1/settings/` | Site settings and meta configuration |
| GET | `/api/v1/team/` | Team members list |

## 🧪 Testing

```powershell
cd backend
pytest tests/ -v
```

## 📝 Default Credentials

After running `create_default_users --insecure` (development only):

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@thehotreports.com | admin123 |
| Editor | editor@thehotreports.com | editor123 |
| Reporter | reporter@thehotreports.com | reporter123 |
| Storywriter | stories@thehotreports.com | stories123 |
| Ads Manager | ads@thehotreports.com | ads123 |

**⚠️ Use `create_default_users` (without `--insecure`) in production — it generates secure random passwords shown once at creation time.**

## 🔒 Security

- JWT authentication with token refresh
- CSRF protection
- Role-based permissions (Django groups)
- Input validation via DRF serializers
- SQL injection protection (Django ORM)
- Rate limiting on sensitive endpoints (newsletter, contact, views)
- VAPID-signed push notifications

## 🌐 SEO

- JSON-LD structured data (articles, tourism)
- Open Graph + Twitter Card meta tags
- Dynamic sitemap (`/sitemap.xml`) for articles, stories, categories, tourism, authors
- `robots.txt`
- Semantic HTML

## 🛠️ Tech Stack

**Backend:**
- Django 6.0 + Django REST Framework 3.17
- SimpleJWT 5.5
- Pillow 12
- drf-spectacular 0.29 (OpenAPI)
- djangorestframework-camel-case 1.4
- pywebpush + py-vapid (push notifications)
- pytest + pytest-django (testing)

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS
- Lucide React icons

**Database:**
- SQLite (single-file, production-ready for this scale)

## 📄 License

Proprietary - The Hot Reports © 2026

## 🤝 Support

For technical support or inquiries, contact the development team.

---

**Nationwide news for Uganda**
