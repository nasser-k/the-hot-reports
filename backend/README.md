# The Hot Reports — Django Backend

Django **6.0** + Django REST Framework backend with JWT auth (SimpleJWT), OpenAPI docs, role-based admin, and push notifications. Local development uses SQLite and disk uploads. Production runs on AWS Lightsail, with media in S3 served through CloudFront.

## Quick Start (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit .env — set DJANGO_SECRET_KEY to a long random string

python manage.py migrate
# News desks are fixed in code. Do not add categories.
python manage.py setup_ad_slots            # 10 ad slots
python manage.py create_default_users --insecure  # dev only
python manage.py runserver
```

| URL | Description |
|-----|-------------|
| `http://127.0.0.1:8000/api/v1/` | API base |
| `http://127.0.0.1:8000/admin/` | Custom role-based admin |
| `http://127.0.0.1:8000/api/docs/` | Swagger UI |
| `http://127.0.0.1:8000/api/redoc/` | ReDoc |
| `http://127.0.0.1:8000/api/schema/` | OpenAPI schema download |

## Frontend env

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Tests

```powershell
pytest tests/ -q
```

---

## API Endpoints

All JSON responses use **camelCase** (`djangorestframework-camel-case`).

### News & Articles

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/categories/` | All categories (no pagination) |
| GET | `/api/v1/articles/` | `?category=&search=&featured=&breaking=&trending=&tag=&page=&page_size=` |
| GET | `/api/v1/articles/{slug}/` | Article detail |
| GET | `/api/v1/articles/{slug}/related/` | `?limit=4` — related by category + tags |
| POST | `/api/v1/articles/{slug}/track-view/` | `{ visitorId? }` — track unique view |
| POST | `/api/v1/articles/{slug}/view/` | `{ visitorId? }` — track article view |

### Serial Stories

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/stories/series/` | `?genre=&status=&is_featured=&search=&ordering=` |
| GET | `/api/v1/stories/series/{slug}/` | Series detail with episode list |
| GET | `/api/v1/stories/series/{slug}/episodes/` | All published episodes for a series |
| GET | `/api/v1/stories/series/genres/` | Available genre choices |
| GET | `/api/v1/stories/series/by-author/` | `?author={slug}` — series by story author |
| GET | `/api/v1/stories/episodes/{slug}/` | Episode detail with comments, images |
| POST | `/api/v1/stories/episodes/{slug}/comment/` | `{ name, email?, content, parent? }` — submit comment (pending approval) |
| POST | `/api/v1/stories/episodes/{slug}/like/` | Toggle like (IP-based). Returns `{ liked, likesCount }` |
| POST | `/api/v1/stories/episodes/{slug}/share/` | `{ platform }` — facebook/whatsapp/twitter/copy |
| POST | `/api/v1/stories/episodes/{slug}/track-view/` | Track view + increment `viewsTotal` |

### Authentication

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/auth/register/` | `{ email, password, fullName? }` |
| POST | `/api/v1/auth/login/` | `{ email, password }` → `{ access, refresh }` |
| POST | `/api/v1/auth/refresh/` | `{ refresh }` → new `access` token |
| GET | `/api/v1/auth/me/` | Current user profile (Bearer token required) |
| PATCH | `/api/v1/auth/me/` | Update profile (multipart supported for avatar) |
| POST | `/api/v1/auth/password/change/` | `{ oldPassword, newPassword }` |

### Tourism

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/tourism/` | `?type=safari\|lodge\|hotel\|campsite\|experience&featured=&search=` |
| GET | `/api/v1/tourism/{slug}/` | Single listing detail |

### Advertising

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/ads/serve/{slot_key}/` | Returns active ad for slot (null if none) |
| POST | `/api/v1/ads/click/{ad_id}/` | Track ad click event |

**Ad slot keys:** `homepage_banner`, `homepage_sidebar`, `article_bottom`, `article_mid`, `article_sidebar`, `category_sidebar`, `stories_sidebar`, `tourism_sidebar`

### Utilities

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/newsletter/subscribe/` | `{ email }` |
| POST | `/api/v1/contact/` | `{ name, email, subject, phone, message }` |
| GET | `/api/v1/push/vapid-public-key/` | VAPID public key for browser subscription |
| POST | `/api/v1/push/subscribe/` | `{ subscription: { endpoint, keys: { p256dh, auth } }, userAgent? }` |
| POST | `/api/v1/push/unsubscribe/` | `{ endpoint }` |
| GET | `/api/v1/settings/` | Site-wide metadata config for frontend |
| GET | `/api/v1/team/` | Team members list for About page |

---

## Management Commands

| Command | Description |
|---------|-------------|
| `python manage.py migrate` | Apply all migrations |
| News desks | Fixed in code: National, Politics, Business, Technology, Education, Health, Culture & Society, Sports, Op-Ed, Africa, World |
| `python manage.py setup_ad_slots` | Create 8 ad slot positions |
| `python manage.py create_default_users` | Create 5 default users with secure random passwords |
| `python manage.py create_default_users --insecure` | Create users with simple passwords (dev only) |
| `python manage.py publish_scheduled` | Publish scheduled articles (run every minute in production) |

---

## User Groups & Permissions

| Group | Permissions |
|-------|-------------|
| `Reporter` | Create/edit own articles (author auto-set), draft-only, view own content only |
| `Editor` | Full article/story/tourism control, categories/tags, approve content, comment moderation |
| `storywriter` | Create/edit own stories (author auto-set), draft-only, view own series only |
| `Ads Manager` | Create tourism listings (created_by auto-set), draft-only, view own listings only |

> Superadmin (is_superuser) has unrestricted access to all models.

---

## Rate Limiting

| Scope | Default |
|-------|---------|
| `article_view` | 60/hour per IP |
| `article_read` | 120/hour per IP |
| `newsletter` | 5/hour per IP |
| `contact` | 10/hour per IP |
