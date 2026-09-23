# Production Deployment Guide — The Hot Reports

## Hosting Architecture

**Backend:** Render (https://render.com)  
**Frontend:** Vercel (https://vercel.com)

---

## Backend Deployment (Render)

### Step 1: Push Code to GitHub
1. Commit all changes to your repository
2. Push to GitHub

### Step 2: Deploy to Render
1. Go to Render dashboard → New + → Blueprint
2. Connect your GitHub repository
3. Render will read `backend/render.yaml` for configuration
4. Review the configuration and deploy

### Step 3: Add Environment Variables
Render will automatically set most variables from `render.yaml`. Add any additional secrets in the Render dashboard:

**Required:**
- `DJANGO_SECRET_KEY` - Generate a long random string
- `EMAIL_HOST_PASSWORD` - Gmail app password for SMTP

**Optional (already in render.yaml):**
- VAPID keys
- Email settings
- User passwords

---

## Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub
Ensure your frontend code is in the same repository or a connected repository.

### Step 2: Deploy to Vercel
1. Go to Vercel dashboard → Add New Project
2. Import your repository
3. Set **Root Directory** to `frontend` (Framework Preset: Next.js)
4. Review and deploy

### Step 3: Environment Variables (Vercel dashboard)
Add variables under **Project → Settings → Environment Variables** (copy values from `frontend/.env.production`). Required for production:

- `NEXT_PUBLIC_API_BASE_URL` — Backend API URL
- `NEXT_PUBLIC_SITE_URL` — `https://thehotreports.com`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — Web push public key
- `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_ADS_EMAIL`, contact/social vars as needed
- All `NEXT_PUBLIC_ADSENSE_*` keys (10 slots — see `frontend/.env.example`)

---

## Environment Variables Reference

### Backend (Render)

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `DEBUG` | `False` | Disable debug mode |
| `DJANGO_SECRET_KEY` | (generate 50+ chars) | Django secret key |
| `ALLOWED_HOSTS` | `the-hot-reports-backend.onrender.com,localhost` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `https://thehotreports.com,https://thehotreports.vercel.app` | Frontend origin(s) |
| `SITE_URL` | `https://thehotreports.com` | Canonical frontend domain |
| `BACKEND_URL` | `https://the-hot-reports-backend.onrender.com` | Absolute URLs for uploaded media |
| `EMAIL_HOST_USER` | `thehotreports@gmail.com` | SMTP email for sending |
| `DEFAULT_FROM_EMAIL` | `The Hot Reports <thehotreports@gmail.com>` | From email address |
| `VAPID_PUBLIC_KEY` | (generate) | Web push public key |
| `VAPID_PRIVATE_KEY` | (generate) | Web push private key |
| `VAPID_ADMIN_EMAIL` | `admin@thehotreports.com` | VAPID contact email |

### Frontend (Vercel)

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://the-hot-reports-backend.onrender.com/api/v1` | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | `https://thehotreports.com` | Frontend domain |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (from backend) | Push notification key |
| `NEXT_PUBLIC_EMAIL` | `info@thehotreports.com` | Public contact email |
| `NEXT_PUBLIC_ADS_EMAIL` | `ads@thehotreports.com` | Ads contact email |

---

## Initial Data Setup

For a **new database** (fresh Render Postgres or local SQLite), run once:

```bash
python manage.py migrate
python manage.py setup_categories       # 12 news categories
python manage.py setup_ad_slots         # 10 ad slots
python manage.py create_default_users   # Secure random passwords (shown once)
python manage.py collectstatic
```

Local dev uses SQLite (`backend/db.sqlite3`) and `backend/media/` automatically. Production uses `DATABASE_URL` (Postgres) and the same `backend/media/` path with a Render persistent disk mounted there (see `render.yaml`).

**Note:** The `render.yaml` includes `collectstatic` and `migrate` in the start command. Run `create_default_users` manually once after first deploy.

---

## Automatic Scheduled Article Publishing

Articles can be scheduled for future publishing. Render Cron Job is configured in `render.yaml`.

### Render Cron Job Configuration

The `render.yaml` includes a cron job that runs every minute:

```yaml
crons:
  - name: publish-scheduled-content
    schedule: "* * * * *"
    command: "python manage.py publish_scheduled"
```

### How It Works

- Checks for articles with `scheduled_publish_at` in the past
- Articles in DRAFT or PENDING status are auto-published
- `published_at` is set to the current time at publish
- No manual intervention needed

---

## Static & Media Files

### Static Files
- Served by **WhiteNoise** (configured in MIDDLEWARE)
- Collected automatically on build: `python manage.py collectstatic --noinput`

### Media Files
- Uploads are stored in `backend/media` (`MEDIA_ROOT`)
- On Render, attach a persistent disk mounted at `/opt/render/project/src/backend/media` (see `render.yaml`)
- Requires a **paid** Render plan (disks are not available on the free tier)

---

## Generating VAPID Keys (Push Notifications)

```bash
pip install py-vapid
python -c "from py_vapid import Vapid; v = Vapid(); v.generate_keys(); print('Public:', v.public_key_urlsafe); print('Private:', v.private_key_urlsafe)"
```

Add the generated keys to:
- `backend/render.yaml` (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
- Vercel Environment Variables (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`)

---

## Email Configuration

### SMTP Settings (Backend)
- **Host:** smtp.gmail.com
- **Port:** 587
- **User:** thehotreports@gmail.com
- **Password:** Gmail App Password (generate in Google Account → Security → 2-Step Verification → App Passwords)

### Public Emails (Frontend)
- **General Contact:** info@thehotreports.com
- **Advertising:** ads@thehotreports.com

---

## Production Checklist

- [ ] `DEBUG=False` in environment
- [ ] `DJANGO_SECRET_KEY` is a long, unique random string
- [ ] `ALLOWED_HOSTS` includes Render domain
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel domains
- [ ] Email SMTP configured with app password
- [ ] VAPID keys configured for push notifications
- [ ] Render Cron Job for scheduled publishing is active
- [ ] Default user passwords set via environment variables
- [ ] Frontend environment variables configured in Vercel
- [ ] SSL enabled (automatic on Render and Vercel)

---

## Custom Domains

### Backend (Render)
1. In Render dashboard → your service → Settings → Custom Domains
2. Add your domain (e.g., `the-hot-reports-backend.onrender.com`)
3. Follow DNS instructions (CNAME)

### Frontend (Vercel)
1. In Vercel dashboard → your project → Settings → Domains
2. Add your domain (e.g., `thehotreports.com`)
3. Follow DNS instructions (CNAME or A record)

---

## Monitoring

### Render
- Automatic health checks
- Logs available in dashboard
- Metrics: CPU, memory, response time

### Vercel
- Build logs
- Analytics dashboard
- Performance monitoring

---

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set
- Ensure database migrations ran successfully

### Frontend Issues
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check browser console for API errors

### Scheduled Publishing Not Working
- Verify Render Cron Job is active in dashboard
- Check logs for cron job execution
- Ensure articles have `scheduled_publish_at` set correctly
