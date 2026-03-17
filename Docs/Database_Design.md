## **\[분야 4\] 데이터베이스 설계 가이드 (Database\_Design.md)**

### **1\. 데이터베이스 개요**

* **DBMS:** PostgreSQL 15+ (PostGIS 확장 설치 필수)  
* **설계 원칙:** \* 촬영 당시의 원천 센서 데이터(Raw Data)를 보존하여 향후 AI 모델 재학습에 활용.  
  * 모바일 1차 산정값과 서버 2차 산정값을 분리 저장하여 신뢰도 비교 가능하게 구성.

### ---

**2\. 주요 테이블 정의**

#### **(1) 가로수 마스터 테이블 (tb\_tree\_master)**

시스템에서 관리되는 가로수의 고유 정보 및 최종 확정된 위치/수치를 저장함.

| 컬럼명 | 타입 | 설명 | 비고 |
| :---- | :---- | :---- | :---- |
| tree\_id | UUID | 가로수 고유 식별자 | PK |
| tree\_code | VARCHAR(20) | 가로수 관리 번호 |  |
| species | VARCHAR(50) | 수종 (국문/학명) |  |
| geom | GEOMETRY(POINT, 4326\) | 최종 보정된 가로수 위치 | PostGIS |
| last\_height | NUMERIC(5,2) | 최종 확정 수고 (m) |  |
| last\_dbh | NUMERIC(5,2) | 최종 확정 흉고직경 (cm) |  |
| created\_at | TIMESTAMP | 최초 등록일 |  |

#### **(2) 데이터 수집 로그 테이블 (tb\_tree\_collection)**

모바일 앱에서 전송된 모든 원천 데이터(센서값, 사진 경로 등)를 기록함.

| 컬럼명 | 타입 | 설명 | 비고 |
| :---- | :---- | :---- | :---- |
| col\_id | BIGSERIAL | 수집 로그 고유 번호 | PK |
| tree\_id | UUID | 대상 가로수 식별자 | FK |
| user\_id | VARCHAR(50) | 조사자 ID |  |
| photo\_url | TEXT | 원본 사진 저장 경로 (S3/NAS) |  |
| user\_geom | GEOMETRY(POINT, 4326\) | 촬영자 당시 GPS 위치 |  |
| azimuth | NUMERIC(5,2) | 촬영 방위각 (0\~360) |  |
| pitch | NUMERIC(5,2) | 카메라 기울기 (Pitch) |  |
| roll | NUMERIC(5,2) | 카메라 회전 (Roll) |  |
| focal\_length | NUMERIC(5,2) | 카메라 초점 거리 (mm) | Exif 정보 |
| collected\_at | TIMESTAMP | 수집 일시 |  |

#### **(3) 수치 산정 결과 테이블 (tb\_tree\_estimation)**

모바일과 서버 AI가 각각 계산한 수치를 비교 및 기록함.

| 컬럼명 | 타입 | 설명 | 비고 |
| :---- | :---- | :---- | :---- |
| est\_id | BIGSERIAL | 산정 결과 고유 번호 | PK |
| col\_id | BIGINT | 관련 수집 로그 번호 | FK |
| est\_type | VARCHAR(10) | 산정 주체 ('MOBILE', 'SERVER') | 구분 |
| tree\_height | NUMERIC(5,2) | 산정된 수고 (m) |  |
| crown\_width | NUMERIC(5,2) | 산정된 수관폭 (m) |  |
| under\_height | NUMERIC(5,2) | 산정된 지하고 (m) |  |
| dbh | NUMERIC(5,2) | 산정된 흉고직경 (cm) |  |
| confidence | NUMERIC(3,2) | AI 분석 신뢰도 (0.0\~1.0) | 서버 분석 시 |
| processed\_at | TIMESTAMP | 산정 처리 일시 |  |

### ---

**3\. 주요 쿼리 및 분석 시나리오**

* **공간 쿼리 (지도 표시용):**  
  SQL  
  \-- 특정 반경 내 가로수 리스트 및 최종 수치 조회  
  SELECT tree\_id, species, ST\_AsText(geom), last\_height   
  FROM tb\_tree\_master   
  WHERE ST\_DWithin(geom, ST\_MakePoint(126\.xxx, 35\.xxx)::geography, 1000);

* **정밀도 분석 (모바일 vs 서버):**  
  SQL  
  \-- 동일 수집 건에 대한 모바일과 서버의 수고(Height) 오차 확인  
  SELECT a.col\_id,   
         m.tree\_height AS mobile\_val,   
         s.tree\_height AS server\_val,  
         ABS(m.tree\_height \- s.tree\_height) AS diff  
  FROM tb\_tree\_collection a  
  JOIN tb\_tree\_estimation m ON a.col\_id \= m.col\_id AND m.est\_type \= 'MOBILE'  
  JOIN tb\_tree\_estimation s ON a.col\_id \= s.col\_id AND s.est\_type \= 'SERVER';

### ---

**4\. 향후 확장 고려사항**

* **시계열 관리:** 동일 tree\_id에 대해 수집 로그가 쌓이면 가로수의 성장 곡선을 그래프화할 수 있음.  
* **병해충 관리:** tb\_tree\_collection에 병해충 여부 태그(Label)를 추가하여 관리 영역 확장 가능.

