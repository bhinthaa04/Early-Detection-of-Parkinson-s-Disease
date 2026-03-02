"""
Parkinson's Disease Prediction ML API
Flask backend for multimodal prediction (spiral drawing + voice recording)
Enhanced PDF report generation with ReportLab - Tailwind-style layout
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import os
import pickle
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

try:
    from tensorflow.keras.models import load_model
    TF_IMPORT_ERROR = None
except Exception as e:
    load_model = None
    TF_IMPORT_ERROR = str(e)

app = Flask(__name__)
# Allow frontend calls for all API routes (predict/report/health) from local dev hosts.
CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Expose-Headers', 'Content-Disposition')
    return response

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'wav', 'mp3', 'flac'}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, 'logo.png')
WATERMARK_PATH = os.path.join(BASE_DIR, 'watermark.png')
MODEL_PATH = os.path.join(BASE_DIR, "model.keras")
PREPROCESS_PATH = os.path.join(BASE_DIR, "preprocess.pkl")

# Load ML artifacts once at startup.
model = None
preprocess = {}
scaler = None
encoder = None
label_encoder = None
MODEL_LOAD_ERROR = None

try:
    if load_model is None:
        raise RuntimeError(f"TensorFlow import failed: {TF_IMPORT_ERROR}")

    model = load_model(MODEL_PATH)
    with open(PREPROCESS_PATH, "rb") as f:
        preprocess = pickle.load(f)

    if isinstance(preprocess, dict):
        scaler = preprocess.get("scaler")
        encoder = preprocess.get("encoder")
        label_encoder = preprocess.get("label_encoder")
    else:
        # Backward compatibility: preprocess.pkl may directly contain a scaler object.
        scaler = preprocess

    if scaler is None:
        raise ValueError("preprocess.pkl does not contain a 'scaler' object.")
except Exception as e:
    MODEL_LOAD_ERROR = str(e)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_spiral_features(image_path):
    features = np.random.rand(10)
    return features

def extract_audio_features(audio_path):
    features = np.random.rand(13)
    return features

def predict_parkinsons(spiral_features, audio_features):
    combined_features = np.concatenate([spiral_features, audio_features])
    risk_score = float(np.mean(combined_features))
    has_parkinsons = bool(risk_score > 0.5)
    confidence = risk_score if has_parkinsons else (1 - risk_score)
    
    if not has_parkinsons:
        stage = "None"
    elif confidence < 0.6:
        stage = "Early Stage (1-2)"
    elif confidence < 0.8:
        stage = "Moderate Stage (2-3)"
    else:
        stage = "Advanced Stage (4-5)"
    
    return {
        "prediction": has_parkinsons,
        "confidence": round(confidence, 4),
        "stage": stage,
        "risk_score": round(risk_score, 4)
    }

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if MODEL_LOAD_ERROR:
            return jsonify({"error": f"Model/preprocess load failed: {MODEL_LOAD_ERROR}"}), 500

        payload = request.get_json(silent=True) or {}
        if "features" not in payload:
            return jsonify({"error": "Missing 'features' in request body"}), 400

        features = payload["features"]
        if not isinstance(features, (list, tuple)):
            return jsonify({"error": "'features' must be a list of numeric values"}), 400

        data = scaler.transform([features])
        prediction = model.predict(data, verbose=0)

        # Always convert model output to plain float for JSON safety.
        result = float(np.asarray(prediction).squeeze())

        response = {
            "prediction": result,
            "message": "Prediction successful"
        }

        # Optional: attach decoded label if encoder/label_encoder exists.
        if label_encoder is not None:
            try:
                class_idx = int(round(result))
                response["predicted_label"] = str(label_encoder.inverse_transform([class_idx])[0])
            except Exception:
                pass
        elif encoder is not None:
            response["encoder_loaded"] = True

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


# ==================== PDF GENERATION FUNCTIONS ====================

def draw_watermark(c, width, height):
    """Draw watermark logo in the background."""
    if os.path.exists(WATERMARK_PATH):
        try:
            c.saveState()
            c.setFillColor(colors.Color(0.3, 0.3, 0.3, alpha=0.06))
            watermark_width = width * 0.5
            watermark_height = watermark_width
            x = (width - watermark_width) / 2
            y = (height - watermark_height) / 2
            c.drawImage(WATERMARK_PATH, x, y, width=watermark_width, height=watermark_height, mask='auto')
            c.restoreState()
        except Exception as e:
            print(f"Watermark error: {e}")
            pass

def draw_header(c, width, height, logo_path=LOGO_PATH):
    """Draw the report header matching HTML format."""
    dark_blue = colors.HexColor('#2c5ba9')
    
    # Header background
    c.setFillColor(dark_blue)
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)
    
    # Left side - Logo and title
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, 40, height - 65, width=50, height=50, mask='auto')
        except:
            pass
    
    # Title
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, height - 40, "NeuroScan AI")
    
    c.setFont("Helvetica", 11)
    c.drawString(100, height - 55, "Parkinson's Disease Screening Report")
    
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(100, height - 70, "AI-Based Preliminary Assessment")
    
    # Right side - Contact info
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 40, height - 35, "Phone: +1 234 567 890")
    c.drawRightString(width - 40, height - 48, "Email: info@neuroscan.ai")
    c.drawRightString(width - 40, height - 61, "Website: www.neuroscan.ai")

def draw_footer(c, width, height, page_num):
    """Draw the report footer."""
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, 24, f"Page {page_num}")
    c.drawCentredString(width / 2, 12, f"Generated By NeuroScan AI | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def draw_section_heading(c, x, y, text, dark_blue, line_width=300):
    """Draw section heading with underline."""
    c.setFillColor(dark_blue)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x, y, text)
    # Underline
    c.setStrokeColor(dark_blue)
    c.setLineWidth(2)
    c.line(x, y - 5, x + line_width, y - 5)
    return y - 15

def _format_bytes(value):
    try:
        size = float(value)
    except (TypeError, ValueError):
        return "N/A"
    if size <= 0:
        return "0 KB"
    kb = size / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    return f"{kb / 1024:.2f} MB"

def _as_text(value, default="N/A"):
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default

def _as_percent(value):
    try:
        num = float(str(value).replace('%', '').strip())
    except (TypeError, ValueError):
        return 0.0
    if num <= 1:
        num *= 100
    return round(num, 1)

def _as_list(value, fallback):
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return cleaned or fallback
    if isinstance(value, str) and value.strip():
        parts = [p.strip() for p in value.replace('\n', ',').split(',') if p.strip()]
        return parts or fallback
    return fallback

def _wrap_text(c, text, max_width, font_name="Helvetica", font_size=9):
    content = _as_text(text, "")
    if not content:
        return [""]
    lines = []
    for paragraph in content.split('\n'):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            test_line = f"{current} {word}"
            if c.stringWidth(test_line, font_name, font_size) <= max_width:
                current = test_line
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines

def _draw_wrapped_text(c, x, y, text, max_width, font_name="Helvetica", font_size=9, color=colors.black, line_height=12):
    c.setFont(font_name, font_size)
    c.setFillColor(color)
    lines = _wrap_text(c, text, max_width, font_name, font_size)
    for line in lines:
        c.drawString(x, y, line)
        y -= line_height
    return y

def _draw_bullets(c, x, y, items, max_width, font_name="Helvetica", font_size=9, color=colors.black, line_height=12):
    c.setFont(font_name, font_size)
    c.setFillColor(color)
    bullet_indent = 12
    for item in items:
        lines = _wrap_text(c, _as_text(item), max_width - bullet_indent, font_name, font_size)
        if not lines:
            continue
        c.drawString(x, y, "-")
        c.drawString(x + bullet_indent, y, lines[0])
        y -= line_height
        for extra_line in lines[1:]:
            c.drawString(x + bullet_indent, y, extra_line)
            y -= line_height
        y -= 2
    return y

def _draw_qr_code(c, value, x, y, size):
    if not value:
        return
    try:
        qr = QrCodeWidget(value)
        bounds = qr.getBounds()
        qr_width = bounds[2] - bounds[0]
        qr_height = bounds[3] - bounds[1]
        scale_x = size / qr_width
        scale_y = size / qr_height
        drawing = Drawing(size, size, transform=[scale_x, 0, 0, scale_y, 0, 0])
        drawing.add(qr)
        renderPDF.draw(drawing, c, x, y)
    except Exception as e:
        print(f"QR draw error: {e}")

def create_enhanced_pdf_report(file_path, patient_data, test_data, result_data, extra_data=None):
    """Create a comprehensive PDF report with aligned multi-section layout."""
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    margin = 40
    content_w = width - (2 * margin)
    page_num = 1

    dark_blue = colors.HexColor('#2c5ba9')
    light_gray = colors.HexColor('#f3f4f6')
    mid_gray = colors.HexColor('#d1d5db')
    text_black = colors.HexColor('#111827')
    green_color = colors.HexColor('#16a34a')
    orange_color = colors.HexColor('#f59e0b')
    red_color = colors.HexColor('#dc2626')

    extra_data = extra_data or {}

    name = _as_text(patient_data.get('name'))
    age = _as_text(patient_data.get('age'))
    gender = _as_text(patient_data.get('gender'))
    patient_id = _as_text(patient_data.get('patient_id'))
    medical_history = _as_text(patient_data.get('medical_history'), 'None reported')
    symptoms_text = _as_text(patient_data.get('symptoms'), 'None reported')
    family_history = _as_text(patient_data.get('family_history'), 'None')
    medications = _as_text(patient_data.get('medications'), 'None')

    test_type = _as_text(test_data.get('test_type'), 'AI-based Multimodal Screening')
    input_data = _as_text(test_data.get('input_data'), 'Spiral Drawing Image, Voice Sample')
    test_date = _as_text(test_data.get('test_date'), datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    test_id = _as_text(test_data.get('test_id'), str(int(datetime.now().timestamp())))

    status = _as_text(result_data.get('status'), 'Negative')
    confidence_percent = _as_percent(result_data.get('confidence'))
    disease_stage = _as_text(result_data.get('disease_stage'), 'None')
    risk_level = _as_text(result_data.get('risk_level'), 'Low')
    is_positive = status.lower() in ['positive', "parkinson's detected", 'parkinson detected', 'detected']

    if risk_level.lower() not in ['low', 'moderate', 'high']:
        if not is_positive:
            risk_level = 'Low'
        elif confidence_percent >= 80:
            risk_level = 'High'
        elif confidence_percent >= 60:
            risk_level = 'Moderate'
        else:
            risk_level = 'Low'

    interpretation = _as_text(
        extra_data.get('interpretation'),
        "The analysis shows indicators that may suggest Parkinson's disease. Clinical confirmation is recommended."
        if is_positive else
        "The analysis indicates no significant indicators of Parkinson's disease at this time."
    )

    image_name = _as_text(extra_data.get('image_file_name'))
    image_size = _format_bytes(extra_data.get('image_file_size'))
    voice_name = _as_text(extra_data.get('voice_file_name'))
    voice_size = _format_bytes(extra_data.get('voice_file_size'))
    voice_duration = _as_text(extra_data.get('voice_duration_seconds'))
    analysis_time = _as_text(extra_data.get('analysis_time_seconds'))
    model_version = _as_text(extra_data.get('model_version'), 'NeuroScan AI v1.2')
    ai_model_type = _as_text(extra_data.get('ai_model_type'), 'Deep Learning (CNN + Machine Learning)')
    ai_features = _as_text(extra_data.get('ai_features'), 'Spiral pattern + Voice MFCC features')
    report_generated_at = _as_text(extra_data.get('report_generated_at'), datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    generated_by = _as_text(extra_data.get('generated_by'), 'NeuroScan AI')
    report_format = _as_text(extra_data.get('report_format'), 'PDF')
    report_language = _as_text(extra_data.get('report_language'), 'English')
    privacy_notice = _as_text(
        extra_data.get('privacy_notice'),
        "This system provides AI-based screening only and is not a medical diagnosis. Consult a neurologist for clinical confirmation."
    )
    verification_url = _as_text(extra_data.get('verification_url'), '')
    doctor_notes = _as_text(extra_data.get('doctor_notes'), '')

    symptom_checklist = extra_data.get('symptom_checklist') if isinstance(extra_data.get('symptom_checklist'), dict) else {}
    tremor = _as_text(symptom_checklist.get('tremor'), 'No')
    slurred_speech = _as_text(symptom_checklist.get('slurred_speech'), 'No')
    handwriting_difficulty = _as_text(symptom_checklist.get('handwriting_difficulty'), 'No')
    fatigue = _as_text(symptom_checklist.get('fatigue'), 'No')
    balance_issues = _as_text(symptom_checklist.get('balance_issues'), 'No')

    baseline = extra_data.get('baseline_comparison') if isinstance(extra_data.get('baseline_comparison'), dict) else {}
    voice_stability = _as_text(baseline.get('voice_stability'), 'N/A')
    handwriting_smoothness = _as_text(baseline.get('handwriting_smoothness'), 'N/A')

    previous_test = extra_data.get('previous_test') if isinstance(extra_data.get('previous_test'), dict) else {}
    prev_date = _as_text(previous_test.get('date'), 'N/A')
    prev_prediction = _as_text(previous_test.get('prediction'), 'N/A')
    prev_trend = _as_text(previous_test.get('trend'), 'N/A')

    recommendations = _as_list(
        extra_data.get('recommendations'),
        [
            'Schedule neurological examination',
            'Repeat screening after 3-6 months',
            'Monitor tremors, stiffness, or speech difficulty',
        ]
    )
    lifestyle_tips = _as_list(
        extra_data.get('lifestyle_tips'),
        [
            'Maintain regular physical activity',
            'Eat balanced meals',
            'Get 7-9 hours sleep',
            'Reduce stress',
        ]
    )

    def start_page():
        draw_watermark(c, width, height)
        draw_header(c, width, height)
        return height - 110

    y = start_page()

    def ensure_space(required_height):
        nonlocal y, page_num
        if y - required_height < 55:
            draw_footer(c, width, height, page_num)
            c.showPage()
            page_num += 1
            y = start_page()

    ensure_space(145)
    y = draw_section_heading(c, margin, y, 'PATIENT & TEST INFORMATION', dark_blue, line_width=content_w)
    y -= 8

    card_h = 92
    half_w = (content_w - 10) / 2
    c.setFillColor(light_gray)
    c.setStrokeColor(mid_gray)
    c.setLineWidth(1)
    c.roundRect(margin, y - card_h, half_w, card_h, 6, fill=True, stroke=True)
    c.roundRect(margin + half_w + 10, y - card_h, half_w, card_h, 6, fill=True, stroke=True)

    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(margin + 10, y - 16, 'Patient Information')
    c.drawString(margin + half_w + 20, y - 16, 'Test Information')

    left_x = margin + 10
    right_x = margin + half_w + 20
    left_y = y - 30
    right_y = y - 30
    left_max = half_w - 20
    right_max = half_w - 20

    left_y = _draw_wrapped_text(c, left_x, left_y, f'Patient Name: {name}', left_max, font_size=8.5, color=text_black)
    left_y = _draw_wrapped_text(c, left_x, left_y, f'Patient ID: {patient_id}', left_max, font_size=8.5, color=text_black)
    left_y = _draw_wrapped_text(c, left_x, left_y, f'Age: {age}', left_max, font_size=8.5, color=text_black)
    _draw_wrapped_text(c, left_x, left_y, f'Gender: {gender}', left_max, font_size=8.5, color=text_black)

    right_y = _draw_wrapped_text(c, right_x, right_y, f'Test ID: {test_id}', right_max, font_size=8.5, color=text_black)
    right_y = _draw_wrapped_text(c, right_x, right_y, f'Test Date & Time: {test_date}', right_max, font_size=8.5, color=text_black)
    _draw_wrapped_text(c, right_x, right_y, f'Test Type: {test_type}', right_max, font_size=8.5, color=text_black)
    y -= card_h + 16

    ensure_space(170)
    y = draw_section_heading(c, margin, y, 'PREDICTION RESULT', dark_blue, line_width=content_w)
    y -= 10
    result_h = 132
    c.setStrokeColor(dark_blue)
    c.setLineWidth(1.5)
    c.setFillColor(colors.white)
    c.roundRect(margin, y - result_h, content_w, result_h, 8, fill=True, stroke=True)
    c.setFillColor(dark_blue)
    c.roundRect(margin, y - 30, content_w, 22, 8, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 10)
    c.drawCentredString(width / 2, y - 22, 'Prediction Result')

    status_text = "Parkinson's Disease Detected" if is_positive else "No Parkinson's Disease Detected"
    status_color = red_color if is_positive else green_color
    if risk_level.lower() == 'moderate' and is_positive:
        status_color = orange_color

    c.setFillColor(status_color)
    c.setFont('Helvetica-Bold', 18)
    c.drawCentredString(width / 2, y - 53, status_text)

    metric_y_title = y - 76
    metric_y_val = y - 93
    col1 = margin + content_w / 6
    col2 = margin + content_w / 2
    col3 = margin + (5 * content_w / 6)
    c.setFillColor(text_black)
    c.setFont('Helvetica', 9)
    c.drawCentredString(col1, metric_y_title, 'Confidence Score')
    c.drawCentredString(col2, metric_y_title, 'Risk Level')
    c.drawCentredString(col3, metric_y_title, 'Disease Stage')
    c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(col1, metric_y_val, f'{confidence_percent}%')
    c.drawCentredString(col2, metric_y_val, risk_level)
    c.drawCentredString(col3, metric_y_val, disease_stage)
    y -= result_h + 14

    ensure_space(86)
    interp_bg = colors.HexColor('#ecfdf3') if not is_positive else (colors.HexColor('#fff7ed') if risk_level.lower() == 'moderate' else colors.HexColor('#fef2f2'))
    interp_border = colors.HexColor('#86efac') if not is_positive else (colors.HexColor('#fdba74') if risk_level.lower() == 'moderate' else colors.HexColor('#fca5a5'))
    c.setFillColor(interp_bg)
    c.setStrokeColor(interp_border)
    c.setLineWidth(1)
    c.roundRect(margin, y - 70, content_w, 70, 6, fill=True, stroke=True)
    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(margin + 10, y - 18, 'What does this mean?')
    _draw_wrapped_text(c, margin + 10, y - 33, f'Your risk level is {risk_level}. {interpretation}', content_w - 20, font_size=9, color=text_black)
    y -= 78

    ensure_space(130)
    y = draw_section_heading(c, margin, y, 'TEST DATA SUMMARY', dark_blue, line_width=content_w)
    y -= 8
    c.setFillColor(light_gray)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - 104, content_w, 104, 6, fill=True, stroke=True)
    c.setFillColor(text_black)
    c.setFont('Helvetica', 9)
    left_x = margin + 10
    right_x = margin + (content_w / 2) + 5
    row_y = y - 18
    c.drawString(left_x, row_y, f'Image Uploaded: {image_name} ({image_size})')
    c.drawString(left_x, row_y - 15, f'Voice Uploaded: {voice_name} ({voice_size})')
    c.drawString(left_x, row_y - 30, f'Voice Sample Duration: {voice_duration} sec')
    c.drawString(right_x, row_y, f'Test Date & Time: {test_date}')
    c.drawString(right_x, row_y - 15, f'Analysis Time: {analysis_time} sec')
    c.drawString(right_x, row_y - 30, f'Model Version: {model_version}')
    c.drawString(right_x, row_y - 45, f'Input Data: {input_data}')
    y -= 116

    ensure_space(105)
    y = draw_section_heading(c, margin, y, 'REPORTED SYMPTOMS', dark_blue, line_width=content_w)
    y -= 8
    c.setFillColor(colors.white)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - 82, content_w, 82, 6, fill=True, stroke=True)
    c.setFillColor(text_black)
    c.setFont('Helvetica', 9)
    c.drawString(margin + 10, y - 18, f'Tremor: {tremor}')
    c.drawString(margin + 10, y - 32, f'Slurred Speech: {slurred_speech}')
    c.drawString(margin + 10, y - 46, f'Handwriting Difficulty: {handwriting_difficulty}')
    c.drawString(margin + 260, y - 18, f'Fatigue: {fatigue}')
    c.drawString(margin + 260, y - 32, f'Balance Issues: {balance_issues}')
    y -= 94

    ensure_space(132)
    y = draw_section_heading(c, margin, y, 'AI ANALYSIS DETAILS', dark_blue, line_width=content_w)
    y -= 8
    c.setFillColor(colors.white)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - 110, content_w, 110, 6, fill=True, stroke=True)
    c.setFillColor(text_black)
    c.setFont('Helvetica', 9)
    c.drawString(margin + 10, y - 18, f'Model Type: {ai_model_type}')
    c.drawString(margin + 10, y - 32, f'Features: {ai_features}')
    c.drawString(margin + 10, y - 46, f'Processing Time: {analysis_time} sec')
    c.drawString(margin + 10, y - 62, f'Voice Stability: {voice_stability}')
    c.drawString(margin + 10, y - 76, f'Handwriting Smoothness: {handwriting_smoothness}')
    c.drawString(margin + 10, y - 92, f'Previous Test: {prev_prediction} ({prev_date}) | Trend: {prev_trend}')
    y -= 122

    ensure_space(130)
    y = draw_section_heading(c, margin, y, 'RECOMMENDED ACTIONS', dark_blue, line_width=content_w)
    y -= 4
    y = _draw_bullets(c, margin + 10, y - 10, recommendations, content_w - 20, color=text_black)
    y -= 8

    ensure_space(120)
    y = draw_section_heading(c, margin, y, 'LIFESTYLE GUIDANCE', dark_blue, line_width=content_w)
    y -= 4
    y = _draw_bullets(c, margin + 10, y - 10, lifestyle_tips, content_w - 20, color=text_black)
    y -= 8

    if risk_level.lower() == 'high':
        ensure_space(58)
        c.setFillColor(colors.HexColor('#fef2f2'))
        c.setStrokeColor(red_color)
        c.roundRect(margin, y - 48, content_w, 48, 6, fill=True, stroke=True)
        c.setFillColor(red_color)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(margin + 10, y - 20, 'Emergency Advisory')
        c.setFillColor(text_black)
        c.setFont('Helvetica', 9)
        c.drawString(margin + 10, y - 34, 'Immediate medical consultation is recommended.')
        y -= 60

    ensure_space(156)
    y = draw_section_heading(c, margin, y, 'REPORT INFO', dark_blue, line_width=content_w)
    y -= 8
    report_h = 136
    c.setFillColor(light_gray)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - report_h, content_w, report_h, 6, fill=True, stroke=True)
    c.setFillColor(text_black)
    c.setFont('Helvetica', 9)
    c.drawString(margin + 10, y - 18, f'Report Generated At: {report_generated_at}')
    c.drawString(margin + 10, y - 32, f'Generated By: {generated_by}')
    c.drawString(margin + 10, y - 46, f'Format: {report_format}')
    c.drawString(margin + 10, y - 60, f'Language: {report_language}')
    c.drawString(margin + 10, y - 76, f'Contact: {_as_text(patient_data.get("contact"), "N/A")}')
    c.drawString(margin + 10, y - 90, f'Email: {_as_text(patient_data.get("email"), "N/A")}')
    qr_size = 82
    qr_x = margin + content_w - qr_size - 14
    qr_y = y - qr_size - 18
    _draw_qr_code(c, verification_url, qr_x, qr_y, qr_size)
    c.setFont('Helvetica', 8)
    c.setFillColor(dark_blue)
    c.drawString(qr_x - 8, qr_y - 10, 'Report Verification QR')
    if verification_url:
        _draw_wrapped_text(c, margin + 10, y - 106, f'Verify URL: {verification_url}', content_w - qr_size - 35, font_size=8, color=dark_blue, line_height=10)
    y -= report_h + 12

    ensure_space(96)
    y = draw_section_heading(c, margin, y, 'CLINICAL NOTES', dark_blue, line_width=content_w)
    y -= 8
    notes_h = 80
    c.setFillColor(colors.white)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - notes_h, content_w, notes_h, 6, fill=True, stroke=True)
    notes_text = doctor_notes if doctor_notes else 'No doctor notes added.'
    _draw_wrapped_text(c, margin + 10, y - 18, notes_text, content_w - 20, font_size=9, color=text_black)
    y -= notes_h + 12

    ensure_space(110)
    y = draw_section_heading(c, margin, y, 'MEDICAL BACKGROUND', dark_blue, line_width=content_w)
    y -= 8
    c.setFillColor(colors.white)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - 90, content_w, 90, 6, fill=True, stroke=True)
    _draw_wrapped_text(c, margin + 10, y - 18, f'Medical History: {medical_history}', content_w - 20, font_size=8.5, color=text_black)
    _draw_wrapped_text(c, margin + 10, y - 36, f'Current Symptoms: {symptoms_text}', content_w - 20, font_size=8.5, color=text_black)
    _draw_wrapped_text(c, margin + 10, y - 54, f'Family History: {family_history}', content_w - 20, font_size=8.5, color=text_black)
    _draw_wrapped_text(c, margin + 10, y - 72, f'Current Medications: {medications}', content_w - 20, font_size=8.5, color=text_black)
    y -= 102

    ensure_space(72)
    c.setFillColor(light_gray)
    c.setStrokeColor(mid_gray)
    c.roundRect(margin, y - 60, content_w, 60, 6, fill=True, stroke=True)
    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(margin + 10, y - 18, 'Privacy & Notice')
    _draw_wrapped_text(c, margin + 10, y - 34, privacy_notice, content_w - 20, font_size=8.5, color=text_black, line_height=11)

    draw_footer(c, width, height, page_num)
    c.save()
    return file_path


# ==================== ROUTES ====================

@app.route('/generate-report', methods=['POST', 'OPTIONS'])
def generate_report():
    """Generate PDF report from form data."""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract form data - matching exact field names from frontend
        patient_data = {
            'name': data.get('name', 'N/A'),
            'age': data.get('age', 'N/A'),
            'gender': data.get('gender', 'N/A'),
            'patient_id': data.get('patient_id', 'N/A'),
            'contact': data.get('contact', 'N/A'),
            'email': data.get('email', 'N/A'),
            'medical_history': data.get('medical_history', 'None reported'),
            'symptoms': data.get('symptoms', 'None reported'),
            'family_history': data.get('family_history', 'None'),
            'medications': data.get('medications', 'None')
        }
        
        test_data = {
            'test_type': data.get('test_type', 'AI-based Multimodal Screening'),
            'input_data': data.get('input_data', 'Spiral Drawing Image, Voice Sample'),
            'test_date': data.get('test_date_time', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            'test_id': data.get('test_id', int(datetime.now().timestamp()))
        }
        
        # Determine result data
        status = data.get('status', 'Negative')
        confidence = data.get('confidence_score', 0)
        
        if isinstance(confidence, str):
            try:
                confidence = float(confidence)
            except:
                confidence = 0
        
        # Convert percentage to decimal if needed
        if confidence > 1:
            confidence = confidence / 100
        
        is_positive = status.lower() in ['positive', "parkinson's detected", 'parkinson detected']
        
        if not is_positive:
            risk_level = "Low"
        elif confidence < 0.6:
            risk_level = "Moderate"
        else:
            risk_level = "High"
        
        result_data = {
            'status': status,
            'confidence': confidence,
            'disease_stage': data.get('disease_stage', 'None'),
            'risk_level': data.get('risk_level', risk_level)
        }

        extra_data = {
            'interpretation': data.get('interpretation'),
            'analysis_time_seconds': data.get('analysis_time_seconds'),
            'voice_duration_seconds': data.get('voice_duration_seconds'),
            'model_version': data.get('model_version'),
            'image_file_name': data.get('image_file_name'),
            'image_file_size': data.get('image_file_size'),
            'voice_file_name': data.get('voice_file_name'),
            'voice_file_size': data.get('voice_file_size'),
            'ai_model_type': data.get('ai_model_type'),
            'ai_features': data.get('ai_features'),
            'recommendations': data.get('recommendations'),
            'lifestyle_tips': data.get('lifestyle_tips'),
            'symptom_checklist': data.get('symptom_checklist'),
            'baseline_comparison': data.get('baseline_comparison'),
            'previous_test': data.get('previous_test'),
            'doctor_notes': data.get('doctor_notes'),
            'report_generated_at': data.get('report_generated_at'),
            'generated_by': data.get('generated_by'),
            'report_format': data.get('report_format'),
            'report_language': data.get('report_language'),
            'privacy_notice': data.get('privacy_notice'),
            'verification_url': data.get('verification_url'),
        }
        
        # Generate PDF
        test_id = int(datetime.now().timestamp())
        file_name = f"parkinson_report_{test_id}.pdf"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        
        create_enhanced_pdf_report(file_path, patient_data, test_data, result_data, extra_data)
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=file_name
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/download-report', methods=['GET'])
def download_report():
    """Generate and download a PDF report (legacy endpoint)."""
    prediction = request.args.get('prediction', 'No')
    confidence = request.args.get('confidence', '0')
    stage = request.args.get('stage', 'None')
    patient_name = request.args.get('patient_name', 'N/A')
    age = request.args.get('age', 'N/A')
    gender = request.args.get('gender', 'N/A')
    patient_id = request.args.get('patient_id', 'N/A')
    
    test_id = int(datetime.now().timestamp())
    file_name = f"parkinson_report_{test_id}.pdf"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    
    patient_data = {
        'name': patient_name,
        'age': age,
        'gender': gender,
        'patient_id': patient_id,
        'medical_history': 'N/A',
        'symptoms': 'N/A',
        'family_history': 'N/A',
        'medications': 'N/A'
    }
    
    test_data = {
        'test_type': 'AI-based Multimodal Screening',
        'input_data': 'Spiral Drawing Image, Voice Sample',
        'test_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'test_id': test_id
    }
    
    result_data = {
        'status': 'Positive' if prediction.lower() == 'yes' else 'Negative',
        'confidence': float(confidence) / 100 if float(confidence) > 1 else float(confidence),
        'disease_stage': stage,
        'risk_level': 'High' if prediction.lower() == 'yes' else 'Low'
    }

    extra_data = {
        'report_generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'generated_by': 'NeuroScan AI',
        'report_format': 'PDF',
        'report_language': 'English',
        'verification_url': request.args.get('verification_url', ''),
    }

    create_enhanced_pdf_report(file_path, patient_data, test_data, result_data, extra_data)
    
    return send_file(
        file_path,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=file_name
    )

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "Parkinson's Disease Prediction ML API",
        "endpoints": {
            "/predict": "POST - JSON body: {\"features\": [...]}",
            "/health": "GET - Health check",
            "/generate-report": "POST - Generate PDF from form data (JSON)",
            "/download-report": "GET - Download PDF report (query params)"
        }
    })

if __name__ == '__main__':
    print("=" * 50)
    print("Parkinson's Disease Prediction ML API")
    print("=" * 50)
    print("Running on http://127.0.0.1:8000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8000, debug=True)

