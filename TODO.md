# Render Deployment TODO - Parkinson ML API

## ✅ Step 1: File Updates Complete
- [x] `ml-api/Procfile`: `web: gunicorn app:app`
- [x] `ml-api/requirements.txt`: Added `gunicorn==22.0.0`, `opencv-python-headless==4.10.0.84`
- [x] `ml-api/app.py`: Port from env var, debug=False

## ⏳ Step 2: Local Test (Run this now)
```
cd ml-api
pip install -r requirements.txt
gunicorn app:app
```
Visit `http://localhost:8000/health` - should return `{"status": "ok"}`

## ⏳ Step 3: Git Commit & Push
```
git add ml-api/
git add TODO.md
git commit -m "Configure Flask ML API for Render deployment"
git push origin main
```

## ⏳ Step 4: Deploy on Render
1. Go to https://render.com, sign up/login (GitHub)
2. **New** > **Web Service**
3. Connect repo: `bhinthaa04/Early-Detection-of-Parkinson-s-Disease`
4. **Settings**:
   - **Root Directory**: `ml-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. **Advanced**:
   - Free tier OK (upgrade if timeout/OOM)
6. **Deploy**

## ⏳ Step 5: Test Deployed API
```
GET {your-render-url}/health
POST {your-render-url}/predict  (with image/audio files)
POST {your-render-url}/generate-report (JSON patient data)
```

## 🔧 Common Errors & Fixes
- **Build fails (deps)**: Add `--no-cache-dir` to build cmd: `pip install --no-cache-dir -r requirements.txt`
- **Port bind error**: Render auto-assigns PORT
- **Gunicorn crash**: Check logs, add `timeout=120` to Procfile: `web: gunicorn app:app --timeout 120`
- **TensorFlow OOM**: Upgrade to Hobby plan ($7/mo, 1GB RAM)
- **Module not found**: Ensure root dir `ml-api/`
- **Model load fail**: Files in repo? Size <100MB?

## 📁 Final ml-api/ Structure (required)
```
ml-api/
├── app.py
├── Procfile
├── requirements.txt
├── model.keras
├── preprocess.pkl
├── logo.png
└── ...
```

**Next: Run Step 2 local test, then proceed!**
