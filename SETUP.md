# NeuroScan AI - Frontend Setup Guide

## 🚀 Quick Start

### 1. Configure Backend URL

Your Flask backend can be running locally or on ngrok. To connect to it:

**Option A: Create a `.env` file in the root directory:**
```bash
VITE_BACKEND_URL=https://your-ngrok-url.ngrok.io
```

**Option B: Default (localhost)**
- The app defaults to `http://localhost:5000` if no env var is set

### 2. Start the Frontend

```bash
npm run dev:client
```

The frontend will be available at `http://localhost:5000`

---

## 📋 Features Built

### Pages:
1. **Home Page** (`/`)
   - Professional landing page with project introduction
   - Call-to-action button ("Check for Parkinson's")
   - Features overview and how-it-works section

2. **Prediction Page** (`/prediction`)
   - Drag-and-drop file upload for spiral drawing image
   - Voice recording upload input
   - Real-time file validation
   - Loading progress indicator

3. **Result Page** (`/result`)
   - Disease status display (Parkinson's Yes/No)
   - Confidence percentage with progress bar
   - Disease stage indicator (Early/Mid/Advanced)
   - Color-coded results (Green for healthy, Yellow/Orange/Red for stages)
   - Download PDF report button

### Components:
- **FileUpload**: Reusable drag-and-drop file upload component
- **DiseaseStageCard**: Displays stage-specific care recommendations
- **Precautions**: Medical guidance based on disease stage
- **DoctorCTA**: Call-to-action for medical consultation

### API Integration:
- Fetch-based API service (`client/src/lib/api-service.ts`)
- Automatic form data preparation for multipart uploads
- Error handling with toast notifications
- Session storage for result persistence

---

## 🔧 Backend API Expected Format

### POST /predict
**Request:**
```
Content-Type: multipart/form-data
- image: File (spiral drawing image)
- audio: File (voice recording)
```

**Response:**
```json
{
  "prediction": true,
  "confidence": 0.92,
  "stage": "Early"
}
```

### GET /download-report
**Query Parameters:**
```
- prediction: "Yes" or "No"
- confidence: "92.5" (percentage as string)
- stage: "Early" or "Mid" or "Advanced"
```

**Response:**
```
Content-Type: application/pdf
(PDF file download)
```

---

## 🎨 Design Features

- **Modern Medical Theme**: Teal/Blue gradient with clean typography
- **Smooth Animations**: Framer Motion for page transitions and loading states
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Data-testid attributes on all interactive elements
- **Error Handling**: Toast notifications for user feedback

---

## 📝 Testing

### Test the frontend flow:
1. Navigate to home page
2. Click "Check for Parkinson's"
3. Upload a test image and audio file
4. Click "Analyze Now"
5. View results with recommendations
6. Download the PDF report

### Expected Results Structure:
- Healthy: Green theme, "Healthy Control"
- Early: Yellow theme, "Early Stage"
- Mid: Orange theme, "Mid Stage"  
- Advanced: Red theme, "Advanced Stage"

---

## 🔐 Security Notes

- Results stored in browser session storage (cleared on tab close)
- No data persistence to database
- All uploads sent directly to your backend
- Medical disclaimer displayed on results page

---

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎯 Next Steps

1. **Update `.env`** with your backend URL (ngrok or local)
2. **Test file uploads** with sample spiral image and audio
3. **Verify API responses** match the expected format
4. **Customize** color scheme or text as needed
5. **Deploy** when ready to production

---

## 📞 Support

For any issues:
- Check browser console for error messages
- Verify backend is running and accessible
- Ensure `.env` has correct backend URL
- Check CORS settings on Flask backend if needed

---

**Built with React, TypeScript, Tailwind CSS, and Framer Motion** ✨
