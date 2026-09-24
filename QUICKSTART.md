# ⚡ Quick Start — The Hot Reports

**Get up and running in under 10 minutes!**

## 🔧 Backend (5 minutes)

```powershell
# 1. Navigate and create virtual environment
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment
copy .env.example .env
# Edit .env — set DJANGO_SECRET_KEY to a long random string

# 4. Setup database and seed data
python manage.py migrate
python manage.py setup_ad_slots          # Creates 8 ad slot positions
python manage.py create_default_users --insecure  # Creates 5 default users (dev only)

# 5. Start server
python manage.py runserver
```

✅ **Backend:** http://127.0.0.1:8000  
🔐 **Admin:** http://127.0.0.1:8000/admin/  
📚 **API Docs:** http://127.0.0.1:8000/api/docs/

**Default login credentials (dev only):**

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@thehotreports.com | admin123 |
| Editor | editor@thehotreports.com | editor123 |
| Reporter | reporter@thehotreports.com | reporter123 |
| Story Writer | stories@thehotreports.com | stories123 |
---

## 🎨 Frontend (2 minutes)

```powershell
# 1. Navigate and install
cd frontend
npm install

# 2. Create .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1" > .env.local
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key" >> .env.local
echo "NEXT_PUBLIC_EMAIL=info@thehotreports.com" >> .env.local
echo "NEXT_PUBLIC_ADS_EMAIL=ads@thehotreports.com" >> .env.local

# 3. Start development server
npm run dev
```

✅ **Frontend:** http://localhost:3000

---

## ✅ Verify Installation

```powershell
# Test backend
cd backend
pytest tests/ -v
# Expected: all tests pass ✅

# Test frontend build
cd frontend
npm run build
# Expected: Build succeeds ✅
```

---

## 🔄 Reset / Fresh Start

```powershell
cd backend

# Delete database
Remove-Item db.sqlite3 -ErrorAction SilentlyContinue

# Re-run setup
python manage.py migrate
python manage.py setup_ad_slots
python manage.py create_default_users --insecure
```
