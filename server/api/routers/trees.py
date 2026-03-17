from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import uuid
import os

from ... import models, schemas, database
from ...database import get_db
from ...ai.analyzer import TreeAnalyzer

router = APIRouter(
    prefix="/api/v1/trees",
    tags=["trees"]
)

# AI 분석기 초기화 (앱 시작 시 한 번만 로드)
analyzer = TreeAnalyzer()

def process_ai_estimation(col_id: int, photo_path: str, distance_m: float, focal_length_mm: float, sensor_width_mm: float, db: Session):
    try:
        if not os.path.exists(photo_path):
            print(f"Photo path does not exist: {photo_path}")
            return
            
        result = analyzer.estimate_measurements(
            image_path=photo_path,
            distance_m=distance_m,
            focal_length_mm=focal_length_mm,
            sensor_width_mm=sensor_width_mm
        )
        
        if "error" in result:
            print(f"AI Analysis Error: {result['error']}")
            return
            
        # 서버 산정 데이터 DB 기록
        db_estimation_server = models.TreeEstimation(
            col_id=col_id,
            est_type=models.EstimateType.SERVER,
            tree_height=result.get("tree_height"),
            dbh=result.get("dbh"),
            crown_width=result.get("crown_width"),
            confidence=result.get("confidence")
        )
        db.add(db_estimation_server)
        db.commit()
    except Exception as e:
        print(f"Background AI processing failed: {e}")

@router.post("/collect", response_model=schemas.TreeMasterResponse)
async def collect_tree_data(
    background_tasks: BackgroundTasks,
    photo: UploadFile = File(...),
    metadata: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        data = json.loads(metadata)
        
        # 임시 디렉토리 생성 및 파일 저장 (실제로는 S3 등 권장)
        os.makedirs("uploads", exist_ok=True)
        photo_path = f"uploads/{photo.filename}"
        with open(photo_path, "wb") as buffer:
            buffer.write(await photo.read())
        
        photo_url = f"/{photo_path}"
        
        db_tree = models.TreeMaster(
            species="Unknown",
        )
        db.add(db_tree)
        db.commit()
        db.refresh(db_tree)
        
        mobile_estimation = data.get("mobile_estimation", {})
        
        db_collection = models.TreeCollection(
            tree_id=db_tree.tree_id,
            user_id="anonymous",
            photo_url=photo_url,
            user_geom=f"POINT({data.get('user_lon', 0)} {data.get('user_lat', 0)})",
            azimuth=data.get('azimuth'),
            pitch=data.get('pitch'),
            roll=data.get('roll'),
            focal_length=data.get('focal_length')
        )
        db.add(db_collection)
        db.commit()
        db.refresh(db_collection)

        db_estimation_mobile = models.TreeEstimation(
            col_id=db_collection.col_id,
            est_type=models.EstimateType.MOBILE,
            tree_height=mobile_estimation.get("height"),
            dbh=mobile_estimation.get("dbh"),
            under_height=mobile_estimation.get("under_height"),
        )
        db.add(db_estimation_mobile)
        db.commit()

        # 백그라운드 태스크로 AI 분석 트리거
        # 거리(D) 값은 앱에서 계산해서 보냈다고 가정 (없으면 기본값 5.0m)
        distance_m = mobile_estimation.get("distance", 5.0)
        focal_length_mm = data.get("focal_length", 26.0)
        sensor_width_mm = data.get("sensor_width_mm", 6.17)
        
        background_tasks.add_task(
            process_ai_estimation,
            db_collection.col_id,
            photo_path,
            distance_m,
            focal_length_mm,
            sensor_width_mm,
            db # Session passed to background thread (might need independent session in prod)
        )

        return db_tree
    
    except json.JSONDecodeError:
         raise HTTPException(status_code=400, detail="Invalid JSON format for metadata")
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[schemas.TreeMasterResponse])
def read_trees(lat: Optional[float] = None, lon: Optional[float] = None, radius: Optional[float] = None, db: Session = Depends(get_db)):
    # 공간 필터링(PostGIS)이 필요하나, 현재는 전체 리스트 또는 일반 필터링으로 처리
    trees = db.query(models.TreeMaster).all()
    return trees

@router.get("/{tree_id}")
def read_tree(tree_id: uuid.UUID, db: Session = Depends(get_db)):
    db_tree = db.query(models.TreeMaster).filter(models.TreeMaster.tree_id == tree_id).first()
    if db_tree is None:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    # 이력(collection, estimation) 함께 반환
    # (실제 구현 시에는 relationship을 이용해 상세 정보 구성)
    return {
        "tree": {
            "id": db_tree.tree_id,
            "species": db_tree.species,
            "geom": db_tree.geom
        },
        "details": "TODO: Collections and Estimations list"
    }
