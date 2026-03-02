import requests
import io
from PIL import Image

url = "http://127.0.0.1:5000/predict"

# Create a test image in memory
img = Image.new('RGB', (100, 100), color='red')
img_bytes = io.BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

# Create dummy audio bytes
audio_bytes = io.BytesIO(b'dummy audio data')

files = {
    'image': ('test.jpg', img_bytes, 'image/jpeg'),
    'audio': ('test.wav', audio_bytes, 'audio/wav')
}

try:
    response = requests.post(url, files=files)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
