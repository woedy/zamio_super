#!/usr/bin/env python3
"""Test script to simulate mobile app audio upload"""
import requests
import tempfile
import numpy as np
import soundfile as sf
from datetime import datetime

# Generate a simple test audio (1 second of sine wave at 440Hz)
sample_rate = 44100
duration = 10  # 10 seconds to match mobile app
t = np.linspace(0, duration, int(sample_rate * duration))
audio = np.sin(2 * np.pi * 440 * t) * 0.3  # 440Hz sine wave

# Save as WAV first (since we can't easily create AAC without ffmpeg)
with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
    temp_path = f.name
    sf.write(temp_path, audio, sample_rate)

# Upload to backend
url = 'http://localhost:8000/api/music-monitor/stream/upload/'
files = {'file': open(temp_path, 'rb')}
data = {
    'station_id': 'ST-TEST123',
    'chunk_id': f'test-{datetime.now().timestamp()}',
    'started_at': datetime.now().isoformat(),
    'duration_seconds': '10',
}
headers = {
    'Authorization': 'Token YOUR_TOKEN_HERE'  # Replace with actual token
}

print(f"Uploading test audio to {url}")
print(f"Data: {data}")

try:
    response = requests.post(url, files=files, data=data, headers=headers)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    import os
    os.unlink(temp_path)
