# Parkinson's Disease Prediction ML API

A Flask-based Python API for multimodal Parkinson's disease prediction using spiral drawings and voice recordings.

## 📁 Project Structure

```
ml-api/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── model.h5           # Trained ML model (you need to add this)
└── README.md          # This file
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```
bash
cd ml-api
pip install -r requirements.txt
```

### Step 2: Add Your Trained Model

Place your trained model file (`.h5` or `.pkl`) in the `ml-api` folder and update the `app.py` to load it.

### Step 3: Run the API

```
bash
python app.py
```

The API will start on `http://127.0.0.1:8000`

## 📡 API Endpoints

### POST /predict
Make a prediction using spiral drawing and voice recording.

**Request:**
- Content-Type: `multipart/form-data`
- Parameters:
  - `image`: Spiral drawing image (PNG, JPG, JPEG)
  - `audio`: Voice recording (WAV, MP3, FLAC)

**Response:**
```
json
{
  "prediction": true,
  "confidence": 0.85,
  "stage": "Moderate Stage (2-3)",
  "risk_score": 0.85
}
```

### GET /health
Health check endpoint.

**Response:**
```
json
{
  "status": "healthy",
  "service": "Parkinson's Prediction ML API",
  "version": "1.0.0"
}
```

### GET /
Root endpoint with API information.

## 🔧 Integration with Express Backend

Update your Express backend to call this Python ML API:

```
javascript
// In your backend routes
app.post('/predict', async (req, res) => {
  const formData = new FormData();
  formData.append('image', req.files.image);
  formData.append('audio', req.files.audio);

  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  res.json(result);
});
```

## 🧠 Model Training Notes

For training your multimodal model:

1. **Spiral Data**: Collect spiral drawings from Parkinson's patients and healthy controls
2. **Voice Data**: Collect voice recordings (sustained vowel "ah" sounds work well)
3. **Use Google Colab**: Train CNN for images + RNN/ML for audio
4. **Export Model**: Save as `.h5` (Keras) or `.pkl` (scikit-learn)

## 📋 Requirements

```
flask
flask-cors
numpy
opencv-python
librosa
tensorflow
reportlab
werkzeug
pillow
scipy
```

## ⚠️ Important

- This is a **placeholder implementation** with demo prediction logic
- Replace the `extract_spiral_features()` and `extract_audio_features()` functions with your actual feature extraction
- Replace the `predict_parkinsons()` function with your actual model prediction
- Add your trained model file to the `ml-api` folder
