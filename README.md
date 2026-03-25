# Parkinson Predictor App

## Quick Start

### Backend + Frontend Dev Server (Port 5000)
```
npm run dev
```

### ML Flask API (Port 8000)
```
cd ml-api
ml-api/start_server.bat
```

### MySQL DB Setup
1. MySQL Workbench → localhost:3306 root/root
2. CREATE DATABASE parkinsons_db;
3. Run schema.sql

### Patient History Page
http://localhost:5000/patient-history

**Menu:** Sidebar → Dashboard → Patient History

Table shows patient_tests data.

### Test Data
1. localhost:5000/patient-form → Create patient + upload spiral/audio.
2. Prediction saves to DB.
3. Refresh History page.

## Original Task - Servers Restarted
Flask (8000), Backend (5000) running.

**Done.**
