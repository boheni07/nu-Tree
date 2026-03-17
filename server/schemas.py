from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .models import EstimateType

class TreeBase(BaseModel):
    species: str
    tree_code: Optional[str] = None
    geom: Optional[str] = None

class TreeCreate(TreeBase):
    pass

class TreeMasterResponse(TreeBase):
    tree_id: UUID
    last_height: Optional[float] = None
    last_dbh: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TreeCollectionCreate(BaseModel):
    user_id: str
    user_geom: Optional[str] = None
    azimuth: Optional[float] = None
    pitch: Optional[float] = None
    roll: Optional[float] = None
    focal_length: Optional[float] = None

class TreeEstimationCreate(BaseModel):
    est_type: EstimateType
    tree_height: Optional[float] = None
    crown_width: Optional[float] = None
    under_height: Optional[float] = None
    dbh: Optional[float] = None
    confidence: Optional[float] = None
