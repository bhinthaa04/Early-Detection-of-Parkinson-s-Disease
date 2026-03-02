# Module Explanation by Team Members

---

## 👤 MEMBER 1: Dataset Training (ML Engineer)

### Role Overview
The ML Engineer is responsible for building and training the machine learning model that powers the Parkinson's disease detection system. This involves collecting, preprocessing, and training multimodal data (spiral drawings and voice recordings).

### Responsibilities

#### 1. Data Collection & Preprocessing
- **Spiral Drawing Dataset**: Collect hand-drawn spiral images from Parkinson's patients and healthy controls
- **Voice Recording Dataset**: Gather audio samples of sustained vowel sounds (/a:/, /o:/)
- **Data Cleaning**: Remove noise, normalize images, enhance audio quality
- **Labeling**: Organize data into Parkinson's positive and negative categories

#### 2. Model Architecture Design
```
┌─────────────────────────────────────────────┐
│         MULTIMODAL ML MODEL                  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐      ┌─────────────┐       │
│  │   IMAGE     │      │   AUDIO     │       │
│  │   BRANCH    │      │   BRANCH    │       │
│  │             │      │             │       │
│  │ CNN Model   │      │ RNN/MLP     │       │
│  │ (ResNet)    │      │ (MFCC)     │       │
│  └──────┬──────┘      └──────┬──────┘       │
│         │                    │               │
│         └────────┬───────────┘               │
│                  ▼                           │
│          ┌─────────────┐                    │
│          │   FUSION   │                    │
│          │   LAYER    │                    │
│          └──────┬──────┘                    │
│                 ▼                            │
│          ┌─────────────┐                    │
│          │  OUTPUT     │                    │
│          │  Layer      │                    │
│          │  - Binary  │                    │
│          │  - Stage   │                    │
│          └─────────────┘                    │
└─────────────────────────────────────────────┘
```

#### 3. Training Pipeline (Google Colab)
- **Framework**: TensorFlow/Keras or PyTorch
- **Hyperparameter Tuning**: Learning rate, batch size, epochs
- **Validation**: K-Fold cross-validation
- **Testing**: Accuracy, Precision, Recall, F1-Score

#### 4. Model Deployment
- Export trained model (H5 format or ONNX)
- Create inference API endpoint
- Optimize for production use

### Key Technologies
- Python, TensorFlow, Keras
- OpenCV (image processing)
- Librosa (audio processing)
- Google Colab (training environment)
- NumPy, Pandas (data manipulation)

### Deliverables
- [x] Dataset collection framework
- [x] Preprocessing pipelines
- [x] Trained CNN model for spiral images
- [x] Audio feature extraction (MFCC)
- [x] Model inference endpoint
- [ ] Full model integration with backend

---

## 👤 MEMBER 2: Frontend Developer

### Role Overview
The Frontend Developer builds the user interface and client-side experience of the Parkinson's Predictor application. They work with React, TypeScript, and modern UI libraries to create an intuitive and responsive interface.

### Responsibilities

#### 1. Application Structure
```
┌─────────────────────────────────────────────┐
│         FRONTEND ARCHITECTURE               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         React 19 App                 │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │   Pages (Routes)             │    │   │
│  │  │   - Home                    │    │   │
│  │  │   - Prediction              │    │   │
│  │  │   - Result                  │    │   │
│  │  │   - Doctor Dashboard        │    │   │
│  │  │   - Therapy Modules        │    │   │
│  │  └─────────────────────────────┘    │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │   Components                │    │   │
│  │  │   - UI (Radix)             │    │   │
│  │  │   - FileUpload             │    │   │
│  │  │   - StepProgress           │    │   │
│  │  │   - ConfidenceGauge        │    │   │
│  │  └─────────────────────────────┘    │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │   Services                 │    │   │
│  │  │   - API Service            │    │   │
│  │  │   - Auth Service           │    │   │
│  │  └─────────────────────────────┘    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### 2. Page Development

**Home Page (`/`)**
- Hero section with 3D brain visualization
- Symptom severity slider (interactive)
- Interactive symptom body map (hoverable hotspots)
- FAQ accordion
- Clinical infographic section

**Prediction Page (`/prediction`)**
- File upload component for spiral images
- File upload component for audio recordings
- Step progress indicator
- Loading states and animations

**Result Page (`/result`)**
- Confidence gauge with animation
- Disease progression timeline
- Stage indicator cards
- Download PDF report button
- Doctor consultation CTA

**Doctor Portal**
- Login authentication form
- Dashboard with patient list
- Search and filter functionality
- Alerts and notifications panel
- Patient detail view

**Therapy Modules**
- Speech clarity exercise (microphone recording)
- Hand stability training (canvas drawing)
- Spiral test assessment
- Educational content pages

#### 3. UI/UX Implementation
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS styling
- Radix UI components
- Framer Motion animations
- Dark/light theme support

### Key Technologies
- React 19, TypeScript
- Vite (build tool)
- Tailwind CSS
- Radix UI
- Framer Motion
- Wouter (routing)
- Lucide React (icons)

### Deliverables
- [x] Complete React application
- [x] All page components
- [x] Responsive layouts
- [x] Interactive UI elements
- [x] API integration
- [x] Animations and transitions

---

## 👤 MEMBER 3: Backend Developer

### Role Overview
The Backend Developer creates the server-side infrastructure, API endpoints, authentication system, and database integration that powers the Parkinson's Predictor application.

### Responsibilities

#### 1. Server Architecture
```
┌─────────────────────────────────────────────┐
│         BACKEND ARCHITECTURE                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │        Express.js Server            │    │
│  │  (Port 3000 / Node.js)              │    │
│  └──────────────────┬──────────────────┘    │
│                     │                        │
│  ┌─────────────────┼──────────────────┐     │
│  │                 │                  │     │
│  ▼                 ▼                  ▼     │
│ ┌────────┐   ┌──────────┐    ┌───────────┐  │
│ │ Routes │   │   Auth   │    │ Session  │  │
│ │        │   │          │    │          │  │
│ │ /api/  │   │Passport │    │Express    │  │
│ │predict │   │.js      │    │Session    │  │
│ │        │   │         │    │           │  │
│ └────┬───┘   └────┬─────┘    └─────┬─────┘  │
│      │            │                 │        │
│      └────────────┼─────────────────┘        │
│                   │                         │
│                   ▼                         │
│  ┌─────────────────────────────────────┐   │
│  │         Storage Layer                │   │
│  │      (Drizzle ORM)                   │   │
│  └──────────────────┬──────────────────┘   │
│                     │                        │
│                     ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │         PostgreSQL Database          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### 2. API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/predict` | POST | Receive image + audio, return prediction |
| `/api/download-report` | GET | Generate and download PDF report |
| `/api/auth/login` | POST | Doctor authentication |
| `/api/auth/logout` | POST | End session |
| `/api/patients` | GET | List all patients |
| `/api/patients/:id` | GET | Get patient details |
| `/api/predictions` | GET | Get prediction history |

#### 3. Authentication System
- Passport.js local strategy
- Session management with express-session
- Secure password hashing
- Protected routes middleware

#### 4. Database Integration
- PostgreSQL database setup
- Drizzle ORM for queries
- User authentication tables
- Patient records storage
- Prediction history

### Key Technologies
- Node.js, Express.js
- TypeScript
- Passport.js
- Express-session
- PostgreSQL
- Drizzle ORM
- Zod (validation)

### Deliverables
- [x] Express.js server setup
- [x] RESTful API endpoints
- [x] Authentication system
- [x] Session management
- [x] Database schema
- [x] API documentation

---

## 📊 Summary Table

| Member | Role | Key Deliverables |
|--------|------|------------------|
| Member 1 | ML Engineer | Dataset, Trained Model, Inference API |
| Member 2 | Frontend Dev | React App, UI Components, Pages |
| Member 3 | Backend Dev | Express Server, APIs, Database |

---

*Document prepared for Project Presentation & Viva Voce*
