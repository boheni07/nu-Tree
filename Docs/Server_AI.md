## **\[분야 2\] 서버 및 AI 분석 엔진 개발 가이드 (Server\_AI.md)**

### **1\. 주요 기능**

* **API 서버:** 모바일 앱의 데이터를 수신하고 PostgreSQL(PostGIS)에 저장.  
* **고정밀 AI 모델 분석:** 서버급 GPU 자원을 활용하여 수집된 사진으로부터 더 정밀한 세그멘테이션 및 수치 재산정.  
* **데이터 정합성 검토:** 앱 산정값과 AI 산정값의 오차 분석 및 최종 데이터 확정.

### **2\. 핵심 기술 스택**

* **Backend:** Python FastAPI 또는 Go (Antigravity Server Core)  
* **Database:** PostgreSQL \+ PostGIS (공간 데이터 처리)  
* **AI Model:** \* **Segmentation:** Mask R-CNN 또는 YOLOv11-seg (수종 분류 및 형태 추출).  
  * **Depth Estimation:** MiDaS 또는 ZoeDepth (단안 이미지 기반 정밀 거리 측정).

### **3\. 정밀 산정 워크플로우**

1. **Object Detection:** 사진 내 가로수 영역 및 지면 접점, 흉고 높이(1.2m) 지점 식별.  
2. **Refinement:** 센서 기반 $D$값과 AI Depth Map을 결합하여 가로수 실측 거리 재계산.  
3. **Dimension Extraction:** 픽셀 단위 마스크 크기를 실제 물리적 수치($cm, m$)로 변환하여 DB 업로드.