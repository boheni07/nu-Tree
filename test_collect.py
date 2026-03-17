import requests
import json

url = "http://127.0.0.1:8000/api/v1/trees/collect"

# 테스트용 빈 이미지 파일 생성
with open("dummy.jpg", "wb") as f:
    f.write(b"test image data")

payload = {
    'metadata': json.dumps({
        "user_lat": 37.5,
        "user_lon": 127.0,
        "azimuth": 45.0,
        "pitch": 10.0,
        "roll": 0.0,
        "focal_length": 26.0,
        "sensor_width_mm": 6.17,
        "mobile_estimation": {
            "height": 10.5,
            "dbh": 20.0,
            "under_height": 2.5,
            "distance": 5.0
        }
    })
}
files = [
    ('photo', ('dummy.jpg', open('dummy.jpg', 'rb'), 'image/jpeg'))
]

try:
    response = requests.post(url, data=payload, files=files)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Request failed:", e)
