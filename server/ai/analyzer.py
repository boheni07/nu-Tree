import math
import numpy as np

try:
    import cv2
    from ultralytics import YOLO
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("Warning: OpenCV or Ultralytics not installed. AI features will be disabled.")


class TreeAnalyzer:
    def __init__(self, model_path: str = "yolo11n-seg.pt"):
        """
        AI 세그멘테이션 모델을 초기화합니다.
        가장 가벼운 n 모델(yolo11n-seg.pt)을 기본값으로 사용합니다.
        """
        self.ai_available = AI_AVAILABLE
        if self.ai_available:
            try:
                self.model = YOLO(model_path)
            except Exception as e:
                print(f"Failed to load YOLO model: {e}")
                self.ai_available = False

    def estimate_measurements(self, image_path: str, distance_m: float, focal_length_mm: float, sensor_width_mm: float):
        """
        수직 실측 거리, 초점 거리, 센서 폭을 기반으로 가로수의 측정치를 계산합니다.
        
        Refinement Workflow:
        1. 이미지 내 가로수 영역 마스킹
        2. 지면 접점, 흉고 지점 탐색
        3. 픽셀 - cm/m 단위 변환 로직
        """
        if not self.ai_available:
            return {"error": "AI libraries not installed"}

        try:
            # 1. AI 세그멘테이션 실행
            results = self.model(image_path)
            img = cv2.imread(image_path)
            if img is None:
                return {"error": "Image not found or cannot be read"}
            
            h, w, _ = img.shape
            
            # 2. 결과 중 가로수(Trunk/Tree) 마스크 추출
            if not results or not getattr(results[0], 'masks', None):
                return {"error": "No object detected", "confidence": 0.0}
            
            mask = results[0].masks.data[0].cpu().numpy() # 0~1 바이너리 배열
            mask_rescaled = cv2.resize(mask, (w, h))

            # --- 3. 흉고직경(DBH) 산출 로직 ---
            # 흉고(지면에서 1.2m) 지점의 Y 픽셀 찾기
            # (단순 모델: 이미지 세로 70% 위치를 흉고로 임시 지정. 실제 개발 시 바닥점 기준 픽셀 계산)
            trunk_y_1_2m = int(h * 0.7)
            
            trunk_pixels = np.where(mask_rescaled[trunk_y_1_2m, :] > 0.5)[0]
            if len(trunk_pixels) == 0:
                 return {"error": "Could not measure DBH at estimated height"}
            
            pixel_width = trunk_pixels[-1] - trunk_pixels[0]
            
            # 핀홀 카메라 공식: 실제크기(cm) = (픽셀폭 * 거리 * 100 * 센서너비) / (이미지폭 * 초점거리)
            # (안전장치 - 초점거리가 0일 경우 에러 방지)
            if focal_length_mm <= 0: focal_length_mm = 26.0
            if sensor_width_mm <= 0: sensor_width_mm = 6.17
            
            actual_dbh_cm = (pixel_width * distance_m * 100 * sensor_width_mm) / (w * focal_length_mm)


            # --- 4. 추가 분석 요소(수고, 지하고, 수관폭) ---
            # 마스크의 전체 bbox에서 높이 픽셀 추출
            y_indices, x_indices = np.where(mask_rescaled > 0.5)
            pixel_height = y_indices.max() - y_indices.min()
            crown_pixel_width = x_indices.max() - x_indices.min()

            # 전체 수고 산정 (m)
            actual_height_m = (pixel_height * distance_m * sensor_width_mm) / (h * focal_length_mm)
            
            # 수관폭 (m)
            actual_crown_width_m = (crown_pixel_width * distance_m * sensor_width_mm) / (w * focal_length_mm)

            return {
                "dbh": round(actual_dbh_cm, 2),
                "tree_height": round(actual_height_m, 2),
                "crown_width": round(actual_crown_width_m, 2),
                "confidence": round(float(results[0].boxes.conf[0]) if results[0].boxes else 0.8, 2)
            }
            
        except Exception as e:
            return {"error": f"AI processing failed: {str(e)}"}
