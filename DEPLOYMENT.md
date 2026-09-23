# Production Deployment — The Hot Reports

## Hosting

**Backend:** AWS Lightsail (Django + Gunicorn)  
**Database:** PostgreSQL (`DATABASE_URL`)  
**Uploads:** Amazon S3, served through CloudFront  
**Frontend:** the public site, with `NEXT_PUBLIC_API_BASE_URL` pointing at the Lightsail API

Local development keeps files on disk. Production sets `USE_S3=True`.

## Lightsail

1. Create an Ubuntu Lightsail instance and a PostgreSQL database.
2. Point a hostname such as `api.thehotreports.com` at the instance.
3. Clone this repo, create a virtualenv, and install `backend/requirements.txt`.
4. Copy `backend/.env.production` to `backend/.env` on the server and fill in the blank secrets there. Do not commit that file.
5. Run:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py setup_categories
python manage.py setup_ad_slots
python manage.py create_default_users
gunicorn hotreports.wsgi:application --bind 0.0.0.0:8000
```

Put Nginx or a Lightsail load balancer in front of Gunicorn and terminate TLS on `api.thehotreports.com`.

Schedule `python manage.py publish_scheduled` every minute with cron on the instance.

## S3 and CloudFront

1. Create a private S3 bucket for uploads.
2. Create an IAM user that can `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on that bucket only.
3. Create a CloudFront distribution with the bucket as the origin. Use Origin Access Control so the bucket is not public.
4. Set these in the server environment:

| Variable | Purpose |
| --- | --- |
| `USE_S3` | `True` in production |
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret |
| `AWS_STORAGE_BUCKET_NAME` | Bucket name |
| `AWS_S3_REGION_NAME` | Bucket region |
| `AWS_CLOUDFRONT_DOMAIN` | CloudFront domain, without `https://` |
| `BACKEND_URL` | Lightsail API origin, for example `https://api.thehotreports.com` |

Uploaded images are stored in the bucket and returned as CloudFront URLs. Django does not serve `/media/` when `USE_S3=True`.

## Environment

Secrets stay in `.env` on each machine. The templates use placeholders only.

Backend: `backend/.env` for local work, `backend/.env.production` for the Lightsail host.  
Frontend: `frontend/.env.local` for local work, `frontend/.env.production` for the public site.

Set `NEXT_PUBLIC_API_BASE_URL` to `https://api.thehotreports.com/api/v1` once that hostname is live. Set `NEXT_PUBLIC_SITE_URL` to the public site origin.
