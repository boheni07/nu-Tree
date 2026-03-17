## **\[분야 1\] 모바일 클라이언트 개발 가이드 (Mobile\_App.md)**

### **1\. 주요 기능**

* **데이터 수집:** 카메라(대표사진), GPS(촬영자 위치), 센서(Pitch, Roll, Yaw), 카메라 메타데이터(수평/수직 FOV).  
* **현장 산정 알고리즘:** 촬영 각도와 센서 데이터를 활용한 가로수 위치 및 크기(수고, 지하고 등) 1차 계산.  
* **데이터 전송:** 원본 사진 및 수집된 모든 메타데이터를 JSON 패키징하여 서버 전송.

### **2\. 핵심 기술 스택**

* **Framework:** Antigravity Mobile SDK (Flutter/Kotlin 기반)  
* **Sensor API:** CoreMotion (iOS) / SensorManager (Android)  
* **Vision:** OpenCV 또는 TensorFlow Lite (가로수 객체 탐지 및 가이드라인 표시)

### **3\. 상세 수치 산정 로직**

* **가로수 GPS 산정:**  
  * 촬영자의 현재 위치($Lat\_p, Lon\_p$)에서 카메라가 가리키는 방위각(Azimuth)과 피사체와의 추정 거리($D$)를 이용하여 계산.  
* **크기 산정 공식 (삼각측량법 적용):**  
  * 스마트폰의 지면 높이($h$)와 지면(뿌리)을 향한 각도($\\theta\_1$), 나무 끝을 향한 각도($\\theta\_2$)를 활용.  
  * **거리 ($D$):** $D \= h \\times \\tan(90^\\circ \- \\theta\_1)$  
  * **수고 ($H$):** $H \= D \\times \\tan(\\theta\_2) \+ h$  
  * **흉고직경 (DBH):** 이미지 내 가로수 폭(pixel)과 거리($D$), 카메라의 $HFOV$를 이용하여 산출.