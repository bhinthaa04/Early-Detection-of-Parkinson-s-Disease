"""Test script to generate PDF report"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_enhanced_pdf_report
import tempfile

# Test data
patient_data = {
    'name': 'John Doe',
    'age': '65',
    'gender': 'Male',
    'patient_id': 'PD12345678',
    'medical_history': 'Diabetes, Hypertension',
    'symptoms': 'Tremors in hands, slow movement, stiffness',
    'family_history': 'No family history of Parkinson\'s',
    'medications': 'Levodopa, Sinemet'
}

test_data = {
    'test_type': 'AI-based Multimodal Screening',
    'input_data': 'Spiral Drawing Image, Voice Sample',
    'test_date': '2024-01-15 10:30:00'
}

result_data = {
    'status': 'Positive',
    'confidence': 0.85,
    'disease_stage': 'Early Stage (1-2)',
    'risk_level': 'High'
}

# Generate PDF
temp_dir = tempfile.gettempdir()
file_path = os.path.join(temp_dir, 'test_report.pdf')

try:
    create_enhanced_pdf_report(file_path, patient_data, test_data, result_data)
    print(f"PDF generated successfully at: {file_path}")
    print(f"File exists: {os.path.exists(file_path)}")
    print(f"File size: {os.path.getsize(file_path)} bytes")
except Exception as e:
    print(f"Error generating PDF: {e}")
    import traceback
    traceback.print_exc()
