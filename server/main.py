from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api.routers import trees

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="nu_Tree API Server")

# CORS 설정 (React 연동을 위해 모든 출처 허용 - 향후 수정 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(trees.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to nu_Tree API System"}
