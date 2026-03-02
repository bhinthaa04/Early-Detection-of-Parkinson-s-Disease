# Parkinson's Predictor - Complete Project Documentation

---

## 1. DESIGN DIAGRAMS

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PARKINSON'S PREDICTOR                          │
│                        SYSTEM ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   FRONTEND       │
                              │   (React + Vite) │
                              │   Port: 5001     │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌────────────────┐ ┌───────────────┐ ┌─────────────────┐
          │  Upload Module  │ │  Therapy      │ │  Doctor Portal  │
          │  - Spiral Image │ │  - Speech     │ │  - Dashboard    │
          │  - Audio Record │ │  - Hand       │ │  - Patient View │
          └────────┬────────┘ │  - Spiral     │ └────────┬────────┘
                   │           └───────────────┘          │
                   ▼                                      ▼
          ┌────────────────────────────────────────────────────────────┐
          │                    BACKEND (Express.js)                    │
          │                      Port: 3000                            │
          │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
          │  │   API       │  │  Auth        │  │  Session        │  │
          │  │   Routes    │  │  (Passport)  │  │  Management     │  │
          │  └──────┬──────┘  └──────────────┘  └─────────────────┘  │
          └─────────┼─────────────────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   ML MODEL          │
          │   /predict endpoint  │
          │   (Google Colab)    │
          └─────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   DATABASE          │
          │   PostgreSQL         │
          │   (Drizzle ORM)     │
          └─────────────────────┘
```

### 1.2 Data Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   USER       │     │   SYSTEM     │     │   ML MODEL   │
│              │     │              │     │              │
│ 1. Upload    │────▶│ 2. Validate │────▶│ 3. Process   │
│    Spiral    │     │    Files     │     │    Image     │
│ 2. Upload    │     │              │     │ 4. Process   │
│    Audio     │     │              │     │    Audio     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                   │
                    ┌──────────────┐               │
                    │   DATABASE   │◀─────────────┘
                    │              │
                    │ 5. Store     │
                    │    Results   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   RESULT     │
                    │   DISPLAY    │
                    │ 6. Show      │
                    │    Prediction│
                    └─────────────┘
```

### 1.3 Component Hierarchy

```
App
├── GlobalLayout
│   ├── Navigation
│   └── Footer
├── Pages
│   ├── Home
│   │   ├── BrainModel (3D)
│   │   ├── SeveritySlider
│   │   ├── SymptomMap
│   │   └── FAQ
│   ├── Prediction
│   │   ├── FileUpload (Image)
│   │   ├── FileUpload (Audio)
│   │   └── StepProgress
│   ├── Result
│   │   ├── ConfidenceGauge
│   │   ├── StageTimeline
│   │   ├── DiseaseStageCard
│   │   ├── Precautions
│   │   └── DoctorCTA
│   ├── DoctorLogin
│   ├── DoctorDashboard
│   │   ├── StatsCards
│   │   ├── PatientList
│   │   └── Alerts
│   ├── DoctorPatientView
│   ├── Therapy (Main)
│   │   ├── SpeechClarity
│   │   ├── HandStability
│   │   ├── SpiralTest
│   │   └── AwarenessLearning
│   ├── ProgressionForecast
│   └── WearableIntegration
└── Components (Shared)
    ├── UI (Radix UI)
    ├── BackendConfig
    └── StepProgress
```

### 1.4 Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
│                    (PostgreSQL + Drizzle ORM)                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐
│    users         │     │   predictions    │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │
│ email            │     │ user_id (FK)     │
│ password_hash    │     │ image_path       │
│ name             │     │ audio_path       │
│ role             │     │ prediction       │
│ created_at       │     │ confidence       │
└──────────────────┘     │ stage            │
                          │ created_at       │
┌──────────────────┐      └──────────────────┘
│   patients       │
├──────────────────┤
│ id (PK)          │
│ doctor_id (FK)   │
│ name             │
│ age              │
│ condition        │
│ status           │
│ last_visit       │
└──────────────────┘
```

---

## 2. MODULE EXPLANATION BY TEAM ROLES

### Team Role: Frontend Developer
**Responsibilities:**
- Built React 19 application with TypeScript
- Created UI components using Radix UI and Tailwind CSS
- Implemented page routing with Wouter
- Added animations with Framer Motion

**Modules Worked On:**
- Home Page - Hero section, symptom slider, interactive map
- Prediction Page - File upload system
- Result Page - Display and visualization
- Global components

### Team Role: Backend Developer
**Responsibilities:**
- Set up Express.js server with TypeScript
- Implemented authentication with Passport.js
- Created REST API routes
- Database integration with Drizzle ORM

**Modules Worked On:**
- Server setup and configuration
- API endpoints (/predict, /download-report)
- Session management
- Authentication system

### Team Role: ML Engineer
**Responsibilities:**
- Developed multimodal ML model
- Trained CNN for spiral image analysis
- Built audio processing pipeline
- Created Google Colab notebooks

**Modules Worked On:**
- Model architecture design
- Training pipeline
- Inference endpoint
- Model optimization

### Team Role: UI/UX Designer
**Responsibilities:**
- Designed visual system
- Created component library
- Implemented responsive layouts
- Added accessibility features

**Modules Worked On:**
- Color scheme and typography
- Component styling
- Animation design
- User experience flow

---

## 3. PARTIAL IMPLEMENTATION / PROTOTYPE PROGRESS

### ✅ Completed Features

| Feature | Status | Description |
|---------|--------|-------------|
| Home Page | 100% | Landing page with all sections |
| Prediction Upload | 100% | Image + Audio file upload |
| Result Display | 100% | Results with confidence gauge |
| Doctor Login | 100% | Authentication portal |
| Doctor Dashboard | 100% | Patient management |
| Speech Therapy | 100% | Voice recording exercise |
| Hand Therapy | 100% | Drawing exercise |
| Spiral Test | 100% | Motor assessment |
| Awareness Learning | 100% | Educational content |

### 🔄 In Progress

| Feature | Status | Description |
|---------|--------|-------------|
| ML Model Integration | 70% | Backend endpoint ready |
| Database Setup | 60% | Schema defined, pending deployment |
| Wearable Integration | 50% | UI ready, API pending |

### 📋 Remaining Tasks

- [ ] Deploy PostgreSQL database
- [ ] Connect ML model to backend
- [ ] Implement real-time notifications
- [ ] Add PDF report generation
- [ ] Mobile app companion

---

## 4. TESTING CASES BY TEAM ROLES

### Team Role: QA Engineer

#### Test Case 1: User Registration & Login
```
Test ID: TC001
Feature: Doctor Authentication
Steps:
  1. Navigate to /doctor-login
  2. Enter valid email: drsmith@neuroclinic.com
  3. Enter valid password: doctor123
  4. Click Sign In button
Expected: Redirect to Doctor Dashboard
Status: ✅ PASS
```

#### Test Case 2: File Upload Validation
```
Test ID: TC002
Feature: Prediction Upload
Steps:
  1. Navigate to /prediction
  2. Upload invalid file type
  3. Attempt to analyze
Expected: Show validation error message
Status: ✅ PASS
```

#### Test Case 3: Result Display
```
Test ID: TC003
Feature: Result Page
Steps:
  1. Complete prediction analysis
  2. Verify confidence gauge animates
  3. Check stage timeline displays
Expected: All elements render correctly
Status: ✅ PASS
```

#### Test Case 4: Navigation Flow
```
Test ID: TC004
Feature: Page Navigation
Steps:
  1. Click through all menu items
  2. Verify each page loads
  3. Check back buttons work
Expected: All pages accessible
Status: ✅ PASS
```

### Team Role: Frontend Tester

#### Test Case 5: Responsive Design
```
Test ID: TC005
Feature: Mobile Responsiveness
Devices Tested:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
Expected: All pages responsive
Status: ✅ PASS
```

#### Test Case 6: Form Validation
```
Test ID: TC006
Feature: Login Form
Steps:
  1. Leave fields empty
  2. Submit form
  3. Verify error messages
Expected: Validation errors shown
Status: ✅ PASS
```

### Team Role: Backend Tester

#### Test Case 7: API Endpoint
```
Test ID: TC007
Feature: /predict endpoint
Method: POST
Input: Multipart form with image + audio
Expected: JSON response with prediction
Status: ✅ PASS (Mock)
```

#### Test Case 8: Authentication
```
Test ID: TC008
Feature: Session Management
Steps:
  1. Login successfully
  2. Refresh page
  3. Verify session persists
Expected: User stays logged in
Status: ✅ PASS
```

---

## 5. PRESENTATION & VIVA VOCE

### Project Summary
Parkinson's Predictor is an AI-powered web application for early detection and management of Parkinson's disease using multimodal analysis of spiral drawings and voice recordings.

### Key Features to Highlight
1. **Multimodal Analysis** - Combines spiral drawing + voice recording
2. **AI-Powered** - Machine learning for accurate detection
3. **Doctor Portal** - Professional patient management
4. **Therapy Exercises** - Home-based rehabilitation
5. **Progression Tracking** - Monitor disease advancement

### Technical Highlights
- React 19 + TypeScript + Vite
- Express.js backend
- PostgreSQL + Drizzle ORM
- Framer Motion animations
- Radix UI components

### Future Enhancements
- Real ML model integration
- Mobile application
- Wearable device sync
- Telemedicine features

---

## 6. SCREENSHOT REFERENCES

The application is running at: **http://localhost:5001/**

### Page URLs:
| Page | Route |
|------|-------|
| Home | / |
| Prediction | /prediction |
| Result | /result |
| Doctor Login | /doctor-login |
| Doctor Dashboard | /doctor-dashboard |
| Speech Therapy | /therapy-speech |
| Hand Therapy | /therapy-hand |
| Spiral Test | /therapy-spiral |
| Awareness | /therapy-awareness |
| Progression | /progression-forecast |
| Wearable | /wearable-integration |

---

*Document generated for Project Presentation & Viva Voce*
