import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class EstimateType(str, enum.Enum):
    MOBILE = "MOBILE"
    SERVER = "SERVER"

class TreeMaster(Base):
    __tablename__ = "tb_tree_master"

    tree_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tree_code = Column(String(20), index=True)
    species = Column(String(50))
    # Note: PostGIS is required for GEOMETRY, using String as placeholder for SQLite
    geom = Column(String) 
    last_height = Column(Float(precision=5, asdecimal=True))
    last_dbh = Column(Float(precision=5, asdecimal=True))
    created_at = Column(DateTime, default=datetime.utcnow)

    collections = relationship("TreeCollection", back_populates="master")

class TreeCollection(Base):
    __tablename__ = "tb_tree_collection"

    col_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tree_id = Column(UUID(as_uuid=True), ForeignKey("tb_tree_master.tree_id"))
    user_id = Column(String(50))
    photo_url = Column(String)
    # Note: PostGIS is required for GEOMETRY, using String as placeholder for SQLite
    user_geom = Column(String)
    azimuth = Column(Float(precision=5, asdecimal=True))
    pitch = Column(Float(precision=5, asdecimal=True))
    roll = Column(Float(precision=5, asdecimal=True))
    focal_length = Column(Float(precision=5, asdecimal=True))
    collected_at = Column(DateTime, default=datetime.utcnow)

    master = relationship("TreeMaster", back_populates="collections")
    estimations = relationship("TreeEstimation", back_populates="collection")

class TreeEstimation(Base):
    __tablename__ = "tb_tree_estimation"

    est_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    col_id = Column(Integer, ForeignKey("tb_tree_collection.col_id"))
    est_type = Column(Enum(EstimateType))
    tree_height = Column(Float(precision=5, asdecimal=True))
    crown_width = Column(Float(precision=5, asdecimal=True))
    under_height = Column(Float(precision=5, asdecimal=True))
    dbh = Column(Float(precision=5, asdecimal=True))
    confidence = Column(Float(precision=3, asdecimal=True), nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)

    collection = relationship("TreeCollection", back_populates="estimations")
