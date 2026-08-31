from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.db_models import Profile, Chart
from backend.app.models.schemas import ProfileCreate, ProfileResponse, ChartResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.post("", response_model=ProfileResponse)
def create_profile(profile_in: ProfileCreate, db: Session = Depends(get_db)):
    profile = Profile(
        name=profile_in.name,
        gender=profile_in.gender,
        date_of_birth=profile_in.date_of_birth,
        time_of_birth=profile_in.time_of_birth,
        place_name=profile_in.place,
        parent_name=profile_in.parent_name,
        personal_details=profile_in.personal_details,
        phone=profile_in.phone,
        email=profile_in.email,
        family_details=profile_in.family_details
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        time_of_birth=profile.time_of_birth,
        place_name=profile.place_name,
        parent_name=profile.parent_name,
        personal_details=profile.personal_details,
        phone=profile.phone,
        email=profile.email,
        family_details=profile.family_details,
        created_at=profile.created_at.isoformat()
    )

@router.get("", response_model=List[ProfileResponse])
def list_profiles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    profiles = db.query(Profile).offset(skip).limit(limit).all()
    return [
        ProfileResponse(
            id=p.id,
            name=p.name,
            gender=p.gender,
            date_of_birth=p.date_of_birth,
            time_of_birth=p.time_of_birth,
            place_name=p.place_name,
            latitude=p.latitude,
            longitude=p.longitude,
            timezone=p.timezone,
            parent_name=p.parent_name,
            personal_details=p.personal_details,
            phone=p.phone,
            email=p.email,
            family_details=p.family_details,
            created_at=p.created_at.isoformat()
        )
        for p in profiles
    ]

@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        time_of_birth=profile.time_of_birth,
        place_name=profile.place_name,
        latitude=profile.latitude,
        longitude=profile.longitude,
        timezone=profile.timezone,
        parent_name=profile.parent_name,
        personal_details=profile.personal_details,
        phone=profile.phone,
        email=profile.email,
        family_details=profile.family_details,
        created_at=profile.created_at.isoformat()
    )

@router.get("/{profile_id}/chart", response_model=ChartResponse)
def get_profile_chart(profile_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.profile_id == profile_id).order_by(Chart.id.desc()).first()
    if not chart:
        raise HTTPException(status_code=404, detail="No computed chart found for this profile")
    return chart.chart_json
