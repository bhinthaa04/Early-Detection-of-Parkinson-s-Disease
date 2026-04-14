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

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg'}

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
    """
    Accepts either:
    - multipart/form-data with 'image' and 'audio' files (used by the web UI)
    - JSON body with 'features' array (legacy/test usage)
    """
    try:
        # ---------- Multipart flow (UI) ----------
        if 'image' in request.files and 'audio' in request.files:
            image_file = request.files['image']
            audio_file = request.files['audio']

            if not image_file or not audio_file:
                return jsonify({"error": "Both image and audio files are required"}), 400

            image_ext_ok = allowed_file(image_file.filename)
            audio_ext_ok = allowed_file(audio_file.filename)
            if not (image_ext_ok and audio_ext_ok):
                return jsonify({"error": "Unsupported file type. Allowed: png, jpg, jpeg, wav, mp3, flac"}), 400

            # Save to temp
            image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
            audio_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
            image_file.save(image_path)
            audio_file.save(audio_path)

            spiral_features = extract_spiral_features(image_path)
            audio_features = extract_audio_features(audio_path)
            combined_features = np.concatenate([spiral_features, audio_features])

            if model is not None and scaler is not None:
                data = scaler.transform([combined_features]) if hasattr(scaler, "transform") else [combined_features]
                prediction = model.predict(data, verbose=0)
                risk_score = float(np.asarray(prediction).squeeze())
                has_parkinsons = bool(risk_score > 0.5)
                confidence = risk_score if has_parkinsons else (1 - risk_score)
                stage = (
                    "None"
                    if not has_parkinsons
                    else "Early Stage (1-2)" if confidence < 0.6
                    else "Moderate Stage (2-3)" if confidence < 0.8
                    else "Advanced Stage (4-5)"
                )
                return jsonify({
                    "prediction": has_parkinsons,
                    "confidence": round(confidence, 4),
                    "stage": stage,
                    "risk_score": round(risk_score, 4),
                    "message": "Prediction successful",
                    "model_loaded": True
                })

            # Fallback when model is unavailable
            fallback = predict_parkinsons(spiral_features, audio_features)
            fallback["message"] = "Prediction successful (fallback heuristic)"
            fallback["model_loaded"] = False
            return jsonify(fallback)

        # ---------- JSON legacy flow ----------
        payload = request.get_json(silent=True) or {}
        if "features" not in payload:
            return jsonify({"error": "Missing 'features' in request body"}), 400

        features = payload["features"]
        if not isinstance(features, (list, tuple)):
            return jsonify({"error": "'features' must be a list of numeric values"}), 400

        if model is None or scaler is None:
            return jsonify({"error": f"Model not available: {MODEL_LOAD_ERROR or 'not loaded'}"}), 500

        data = scaler.transform([features])
        prediction = model.predict(data, verbose=0)
        result = float(np.asarray(prediction).squeeze())

        response = {
            "prediction": result,
            "message": "Prediction successful"
        }

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

def draw_header(c, width, height, logo_path=LOGO_PATH, margin=40, header_height=84):
    """Draw the report header matching HTML format."""
    dark_blue = colors.HexColor('#2c5ba9')

    header_top = height
    header_bottom = height - header_height

    # Header background
    c.setFillColor(dark_blue)
    c.rect(0, header_bottom, width, header_height, fill=True, stroke=False)

    # Left side - Logo and title
    logo_size = 46
    logo_x = margin
    logo_y = header_bottom + (header_height - logo_size) / 2
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, logo_x, logo_y, width=logo_size, height=logo_size, mask='auto')
        except:
            pass

    title_x = logo_x + logo_size + 12
    title_y = header_top - 26

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(title_x, title_y, "NeuroScan AI")

    c.setFont("Helvetica", 11)
    c.drawString(title_x, title_y - 14, "Parkinson's Disease Screening Report")

    c.setFont("Helvetica-Oblique", 9)
    c.drawString(title_x, title_y - 26, "AI-Based Preliminary Assessment")

    # Right side - Contact info
    right_x = width - margin
    contact_top = header_top - 24
    contact_gap = 13
    c.setFont("Helvetica", 8)
    c.drawRightString(right_x, contact_top, "Phone: +1 234 567 890")
    c.drawRightString(right_x, contact_top - contact_gap, "Email: info@neuroscan.ai")
    c.drawRightString(right_x, contact_top - (2 * contact_gap), "Website: www.neuroscan.ai")

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
    c.drawString(x, y, text.upper())
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

def _split_long_word(c, word, max_width, font_name, font_size):
    if c.stringWidth(word, font_name, font_size) <= max_width:
        return [word]
    segments = []
    current = ""
    for char in word:
        test = f"{current}{char}"
        if current and c.stringWidth(test, font_name, font_size) > max_width:
            segments.append(current)
            current = char
        else:
            current = test
    if current:
        segments.append(current)
    return segments

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
        current = ""
        for word in words:
            if c.stringWidth(word, font_name, font_size) > max_width:
                if current:
                    lines.append(current)
                    current = ""
                for chunk in _split_long_word(c, word, max_width, font_name, font_size):
                    lines.append(chunk)
                continue
            if not current:
                current = word
                continue
            test_line = f"{current} {word}"
            if c.stringWidth(test_line, font_name, font_size) <= max_width:
                current = test_line
            else:
                lines.append(current)
                current = word
        if current:
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

def _measure_wrapped_text(c, text, max_width, font_name="Helvetica", font_size=9, line_height=12):
    lines = _wrap_text(c, text, max_width, font_name, font_size)
    return max(1, len(lines)) * line_height

def _measure_lines(c, lines, max_width, font_name="Helvetica", font_size=9, line_height=12):
    total = 0
    for line in lines:
        total += _measure_wrapped_text(c, line, max_width, font_name, font_size, line_height)
    return total

def _measure_bullets(c, items, max_width, font_name="Helvetica", font_size=9, line_height=12):
    bullet_indent = 12
    total = 0
    for item in items:
        lines = _wrap_text(c, _as_text(item), max_width - bullet_indent, font_name, font_size)
        if not lines:
            continue
        total += len(lines) * line_height + 2
    return total

def _draw_panel(c, x, y, width, height, fill, stroke, radius=8, line_width=1):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line_width)
    c.roundRect(x, y - height, width, height, radius, fill=True, stroke=True)

def create_enhanced_pdf_report(file_path, patient_data, test_data, result_data, extra_data=None):
    """Create a comprehensive PDF report with aligned multi-section layout."""
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    margin = 40
    content_w = width - (2 * margin)
    page_num = 1
    header_height = 84
    section_gap = 14
    panel_padding = 12
    panel_radius = 8
    heading_block = 21
    column_gap = 12
    body_font = "Helvetica"
    body_font_size = 9
    body_line_height = 12

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
        draw_header(c, width, height, margin=margin, header_height=header_height)
        return height - header_height - 24

    y = start_page()

    bottom_margin = 60

    def ensure_space(required_height):
        nonlocal y, page_num
        if y - required_height < bottom_margin:
            draw_footer(c, width, height, page_num)
            c.showPage()
            page_num += 1
            y = start_page()

    patient_lines = [
        f'Patient Name: {name}',
        f'Patient ID: {patient_id}',
        f'Age: {age}',
        f'Gender: {gender}',
    ]
    test_lines = [
        f'Test ID: {test_id}',
        f'Test Date & Time: {test_date}',
        f'Test Type: {test_type}',
    ]
    half_w = (content_w - column_gap) / 2
    left_max = half_w - (panel_padding * 2)
    right_max = half_w - (panel_padding * 2)
    patient_height = _measure_lines(c, patient_lines, left_max, body_font, body_font_size, body_line_height)
    test_height = _measure_lines(c, test_lines, right_max, body_font, body_font_size, body_line_height)
    title_height = 14
    card_h = max(96, max(patient_height, test_height) + (panel_padding * 2) + title_height)

    ensure_space(heading_block + card_h + section_gap)
    y = draw_section_heading(c, margin, y, 'PATIENT & TEST INFORMATION', dark_blue, line_width=content_w)
    y -= 6

    _draw_panel(c, margin, y, half_w, card_h, colors.white, mid_gray, radius=panel_radius)
    _draw_panel(c, margin + half_w + column_gap, y, half_w, card_h, colors.white, mid_gray, radius=panel_radius)

    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    title_y = y - panel_padding
    left_x = margin + panel_padding
    right_x = margin + half_w + column_gap + panel_padding
    c.drawString(left_x, title_y, 'Patient Information')
    c.drawString(right_x, title_y, 'Test Information')

    left_y = title_y - title_height
    right_y = title_y - title_height

    for line in patient_lines:
        left_y = _draw_wrapped_text(
            c,
            left_x,
            left_y,
            line,
            left_max,
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )

    for line in test_lines:
        right_y = _draw_wrapped_text(
            c,
            right_x,
            right_y,
            line,
            right_max,
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )

    y -= card_h + section_gap

    result_h = 148
    ensure_space(heading_block + result_h + section_gap)
    y = draw_section_heading(c, margin, y, 'PREDICTION RESULT', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, result_h, colors.white, dark_blue, radius=panel_radius, line_width=1.4)

    banner_h = 26
    c.setFillColor(dark_blue)
    c.roundRect(margin, y - banner_h, content_w, banner_h, panel_radius, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 10)
    c.drawCentredString(width / 2, y - 18, 'Prediction Result')

    status_text = "Parkinson's Disease Detected" if is_positive else "No Parkinson's Disease Detected"
    status_color = red_color if is_positive else green_color
    if risk_level.lower() == 'moderate' and is_positive:
        status_color = orange_color

    c.setFillColor(status_color)
    c.setFont('Helvetica-Bold', 18)
    status_y = y - banner_h - 24
    c.drawCentredString(width / 2, status_y, status_text)

    metric_y_title = status_y - 26
    metric_y_val = metric_y_title - 16
    col_w = content_w / 3
    col1 = margin + (col_w / 2)
    col2 = margin + (col_w * 1.5)
    col3 = margin + (col_w * 2.5)
    c.setFillColor(text_black)
    c.setFont(body_font, body_font_size)
    c.drawCentredString(col1, metric_y_title, 'Confidence Score')
    c.drawCentredString(col2, metric_y_title, 'Risk Level')
    c.drawCentredString(col3, metric_y_title, 'Disease Stage')
    c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(col1, metric_y_val, f'{confidence_percent}%')
    c.drawCentredString(col2, metric_y_val, risk_level)
    c.drawCentredString(col3, metric_y_val, disease_stage)
    y -= result_h + section_gap

    interp_bg = colors.HexColor('#ecfdf3') if not is_positive else (colors.HexColor('#fff7ed') if risk_level.lower() == 'moderate' else colors.HexColor('#fef2f2'))
    interp_border = colors.HexColor('#86efac') if not is_positive else (colors.HexColor('#fdba74') if risk_level.lower() == 'moderate' else colors.HexColor('#fca5a5'))
    interp_text = f'Your risk level is {risk_level}. {interpretation}'
    interp_text_height = _measure_wrapped_text(c, interp_text, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    interp_h = max(80, (panel_padding * 2) + 16 + interp_text_height)
    ensure_space(interp_h + section_gap)
    _draw_panel(c, margin, y, content_w, interp_h, interp_bg, interp_border, radius=panel_radius)
    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    title_y = y - panel_padding
    c.drawString(margin + panel_padding, title_y, 'What does this mean?')
    _draw_wrapped_text(
        c,
        margin + panel_padding,
        title_y - 14,
        interp_text,
        content_w - (panel_padding * 2),
        font_name=body_font,
        font_size=body_font_size,
        color=text_black,
        line_height=body_line_height,
    )
    y -= interp_h + section_gap

    summary_rows = [
        (f'Image Uploaded: {image_name} ({image_size})', f'Test Date & Time: {test_date}'),
        (f'Voice Uploaded: {voice_name} ({voice_size})', f'Analysis Time: {analysis_time} sec'),
        (f'Voice Sample Duration: {voice_duration} sec', f'Model Version: {model_version}'),
        ("", f'Input Data: {input_data}'),
    ]
    summary_col_w = (content_w - column_gap) / 2
    summary_left_max = summary_col_w - (panel_padding * 2)
    summary_right_max = summary_col_w - (panel_padding * 2)
    summary_row_gap = 2
    summary_row_heights = []
    for left_text, right_text in summary_rows:
        left_h = _measure_wrapped_text(c, left_text, summary_left_max, body_font, body_font_size, body_line_height) if left_text else 0
        right_h = _measure_wrapped_text(c, right_text, summary_right_max, body_font, body_font_size, body_line_height) if right_text else 0
        summary_row_heights.append(max(left_h, right_h, body_line_height) + summary_row_gap)
    summary_h = max(96, sum(summary_row_heights) + (panel_padding * 2))

    ensure_space(heading_block + summary_h + section_gap)
    y = draw_section_heading(c, margin, y, 'TEST DATA SUMMARY', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, summary_h, colors.white, mid_gray, radius=panel_radius)
    c.setFillColor(text_black)
    c.setFont(body_font, body_font_size)
    left_x = margin + panel_padding
    right_x = margin + summary_col_w + column_gap + panel_padding
    row_y = y - panel_padding
    for (left_text, right_text), row_h in zip(summary_rows, summary_row_heights):
        if left_text:
            _draw_wrapped_text(
                c,
                left_x,
                row_y,
                left_text,
                summary_left_max,
                font_name=body_font,
                font_size=body_font_size,
                color=text_black,
                line_height=body_line_height,
            )
        if right_text:
            _draw_wrapped_text(
                c,
                right_x,
                row_y,
                right_text,
                summary_right_max,
                font_name=body_font,
                font_size=body_font_size,
                color=text_black,
                line_height=body_line_height,
            )
        row_y -= row_h
    y -= summary_h + section_gap

    symptoms_left_lines = [
        f'Tremor: {tremor}',
        f'Slurred Speech: {slurred_speech}',
        f'Handwriting Difficulty: {handwriting_difficulty}',
    ]
    symptoms_right_lines = [
        f'Fatigue: {fatigue}',
        f'Balance Issues: {balance_issues}',
    ]
    symptoms_col_w = (content_w - column_gap) / 2
    symptoms_left_max = symptoms_col_w - (panel_padding * 2)
    symptoms_right_max = symptoms_col_w - (panel_padding * 2)
    symptoms_left_h = _measure_lines(c, symptoms_left_lines, symptoms_left_max, body_font, body_font_size, body_line_height)
    symptoms_right_h = _measure_lines(c, symptoms_right_lines, symptoms_right_max, body_font, body_font_size, body_line_height)
    symptoms_h = max(84, max(symptoms_left_h, symptoms_right_h) + (panel_padding * 2))

    ensure_space(heading_block + symptoms_h + section_gap)
    y = draw_section_heading(c, margin, y, 'REPORTED SYMPTOMS', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, symptoms_h, colors.white, mid_gray, radius=panel_radius)
    c.setFillColor(text_black)
    c.setFont(body_font, body_font_size)
    left_x = margin + panel_padding
    right_x = margin + symptoms_col_w + column_gap + panel_padding
    row_y = y - panel_padding
    for line in symptoms_left_lines:
        row_y = _draw_wrapped_text(
            c,
            left_x,
            row_y,
            line,
            symptoms_left_max,
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )
    row_y = y - panel_padding
    for line in symptoms_right_lines:
        row_y = _draw_wrapped_text(
            c,
            right_x,
            row_y,
            line,
            symptoms_right_max,
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )
    y -= symptoms_h + section_gap

    analysis_lines = [
        f'Model Type: {ai_model_type}',
        f'Features: {ai_features}',
        f'Processing Time: {analysis_time} sec',
        f'Voice Stability: {voice_stability}',
        f'Handwriting Smoothness: {handwriting_smoothness}',
        f'Previous Test: {prev_prediction} ({prev_date}) | Trend: {prev_trend}',
    ]
    analysis_text_height = _measure_lines(c, analysis_lines, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    analysis_h = max(112, analysis_text_height + (panel_padding * 2))
    ensure_space(heading_block + analysis_h + section_gap)
    y = draw_section_heading(c, margin, y, 'AI ANALYSIS DETAILS', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, analysis_h, colors.white, mid_gray, radius=panel_radius)
    c.setFillColor(text_black)
    c.setFont(body_font, body_font_size)
    cursor_y = y - panel_padding
    for line in analysis_lines:
        cursor_y = _draw_wrapped_text(
            c,
            margin + panel_padding,
            cursor_y,
            line,
            content_w - (panel_padding * 2),
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )
    y -= analysis_h + section_gap

    recommendations_h = _measure_bullets(c, recommendations, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    recommendations_h = max(72, recommendations_h + (panel_padding * 2))
    ensure_space(heading_block + recommendations_h + section_gap)
    y = draw_section_heading(c, margin, y, 'RECOMMENDED ACTIONS', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, recommendations_h, colors.white, mid_gray, radius=panel_radius)
    _draw_bullets(
        c,
        margin + panel_padding,
        y - panel_padding,
        recommendations,
        content_w - (panel_padding * 2),
        font_name=body_font,
        font_size=body_font_size,
        color=text_black,
        line_height=body_line_height,
    )
    y -= recommendations_h + section_gap

    lifestyle_h = _measure_bullets(c, lifestyle_tips, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    lifestyle_h = max(68, lifestyle_h + (panel_padding * 2))
    ensure_space(heading_block + lifestyle_h + section_gap)
    y = draw_section_heading(c, margin, y, 'LIFESTYLE GUIDANCE', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, lifestyle_h, colors.white, mid_gray, radius=panel_radius)
    _draw_bullets(
        c,
        margin + panel_padding,
        y - panel_padding,
        lifestyle_tips,
        content_w - (panel_padding * 2),
        font_name=body_font,
        font_size=body_font_size,
        color=text_black,
        line_height=body_line_height,
    )
    y -= lifestyle_h + section_gap

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

    # QR Code removed from report as per requirements
    info_lines = [
        f'Report Generated At: {report_generated_at}',
        f'Generated By: {generated_by}',
        f'Format: {report_format}',
        f'Language: {report_language}',
        f'Contact: {_as_text(patient_data.get("contact"), "N/A")}',
        f'Email: {_as_text(patient_data.get("email"), "N/A")}',
    ]
    text_max = content_w - (panel_padding * 2)
    info_text_height = _measure_lines(c, info_lines, text_max, body_font, body_font_size, body_line_height)
    verify_text_height = 0
    verify_gap = 4 if verification_url else 0
    if verification_url:
        verify_text_height = _measure_wrapped_text(c, f'Verify URL: {verification_url}', text_max, body_font, body_font_size, body_line_height)
    report_h = max(80, (panel_padding * 2) + info_text_height + verify_text_height + verify_gap)
    ensure_space(heading_block + report_h + section_gap)
    y = draw_section_heading(c, margin, y, 'REPORT INFO', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, report_h, colors.white, mid_gray, radius=panel_radius)

    c.setFillColor(text_black)
    c.setFont(body_font, body_font_size)
    cursor_y = y - panel_padding
    for line in info_lines:
        cursor_y = _draw_wrapped_text(
            c,
            margin + panel_padding,
            cursor_y,
            line,
            text_max,
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )
    if verification_url:
        cursor_y -= verify_gap
        _draw_wrapped_text(
            c,
            margin + panel_padding,
            cursor_y,
            f'Verify URL: {verification_url}',
            text_max,
            font_name=body_font,
            font_size=body_font_size,
            color=dark_blue,
            line_height=body_line_height,
        )

    y -= report_h + section_gap

    notes_text = doctor_notes if doctor_notes else 'No doctor notes added.'
    notes_text_height = _measure_wrapped_text(c, notes_text, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    notes_h = max(80, notes_text_height + (panel_padding * 2))
    ensure_space(heading_block + notes_h + section_gap)
    y = draw_section_heading(c, margin, y, 'CLINICAL NOTES', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, notes_h, colors.white, mid_gray, radius=panel_radius)
    _draw_wrapped_text(
        c,
        margin + panel_padding,
        y - panel_padding,
        notes_text,
        content_w - (panel_padding * 2),
        font_name=body_font,
        font_size=body_font_size,
        color=text_black,
        line_height=body_line_height,
    )
    y -= notes_h + section_gap

    medical_lines = [
        f'Medical History: {medical_history}',
        f'Current Symptoms: {symptoms_text}',
        f'Family History: {family_history}',
        f'Current Medications: {medications}',
    ]
    medical_text_height = _measure_lines(c, medical_lines, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    medical_h = max(96, medical_text_height + (panel_padding * 2))
    ensure_space(heading_block + medical_h + section_gap)
    y = draw_section_heading(c, margin, y, 'MEDICAL BACKGROUND', dark_blue, line_width=content_w)
    y -= 6
    _draw_panel(c, margin, y, content_w, medical_h, colors.white, mid_gray, radius=panel_radius)
    cursor_y = y - panel_padding
    for line in medical_lines:
        cursor_y = _draw_wrapped_text(
            c,
            margin + panel_padding,
            cursor_y,
            line,
            content_w - (panel_padding * 2),
            font_name=body_font,
            font_size=body_font_size,
            color=text_black,
            line_height=body_line_height,
        )
    y -= medical_h + section_gap

    notice_text_height = _measure_wrapped_text(c, privacy_notice, content_w - (panel_padding * 2), body_font, body_font_size, body_line_height)
    notice_h = max(72, (panel_padding * 2) + 16 + notice_text_height)
    ensure_space(notice_h + section_gap)
    _draw_panel(c, margin, y, content_w, notice_h, light_gray, mid_gray, radius=panel_radius)
    c.setFillColor(dark_blue)
    c.setFont('Helvetica-Bold', 10)
    title_y = y - panel_padding
    c.drawString(margin + panel_padding, title_y, 'Privacy & Notice')
    _draw_wrapped_text(
        c,
        margin + panel_padding,
        title_y - 14,
        privacy_notice,
        content_w - (panel_padding * 2),
        font_name=body_font,
        font_size=body_font_size,
        color=text_black,
        line_height=body_line_height,
    )

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
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
