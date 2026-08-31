from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    gender = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=False)
    time_of_birth = Column(String(50), nullable=False)
    place_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timezone = Column(String(100), nullable=True)
    parent_name = Column(String(255), nullable=True)
    personal_details = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    family_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    charts = relationship("Chart", back_populates="profile", cascade="all, delete-orphan")

class Chart(Base):
    __tablename__ = "charts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    panchangam_system = Column(String(50), default="thirukkanitham")
    chart_style = Column(String(50), default="tamil")
    output_mode = Column(String(50), default="full")
    chart_json = Column(JSON, nullable=False)
    narration_json = Column(JSON, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="charts")

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id_boy = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    profile_id_girl = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    result_json = Column(JSON, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow)
