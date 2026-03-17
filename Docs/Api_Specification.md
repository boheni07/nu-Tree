## **\[분야 8\] API 엔드포인트 설계 (API\_Specification.md)**

모바일 앱과 서버 간의 원활한 데이터 통신을 위한 RESTful API 규격입니다.

### **1\. 가로수 데이터 전송 (Mobile → Server)**

* **Endpoint:** POST /api/v1/trees/collect  
* **Content-Type:** multipart/form-data  
* **Parameters:**  
  * photo: 이미지 파일 (Multipart)  
  * metadata: JSON 스트링  
    * user\_lat, user\_lon: 촬영자 위치  
    * azimuth, pitch, roll: 센서값  
    * mobile\_estimation: { height, dbh, under\_height } (앱 측 산정값)

### **2\. 가로수 목록 조회 (Web ← Server)**

* **Endpoint:** GET /api/v1/trees  
* **Query Params:** lat, lon, radius (공간 필터링)  
* **Response:** 가로수 마스터 정보 및 최신 산정 수치 배열

### **3\. 가로수 상세 정보 조회**

* **Endpoint:** GET /api/v1/trees/{tree\_id}  
* **Response:** 특정 가로수의 모든 이력(1, 2차 산정값 비교 포함) 및 원본 사진 경로