from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app.services.parser import parser_service
from app.services.predictor import predictor_service
from app.services.similarity import gap_analyzer

app = FastAPI(
    title="EmployIQ Python AI Microservice",
    description="Microservice powering NLP resume parsing, XGBoost employability predictions, and FAISS skill gap matching.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeParseRequest(BaseModel):
    resume_text: str

class EmployabilityPredictRequest(BaseModel):
    cgpa: float
    projects_count: int
    coding_rating: int
    skills_count: int
    internships_count: int

class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str

@app.get("/")
def read_root():
    return {"service": "EmployIQ AI Microservice", "status": "active", "version": "1.0.0"}

@app.post("/api/v1/ai/parse-resume")
def parse_resume(payload: ResumeParseRequest):
    if not payload.resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required")
    return parser_service.parse_text(payload.resume_text)

@app.post("/api/v1/ai/predict-employability")
def predict_employability(payload: EmployabilityPredictRequest):
    return predictor_service.predict(
        cgpa=payload.cgpa,
        projects_count=payload.projects_count,
        coding_rating=payload.coding_rating,
        skills_count=payload.skills_count,
        internships_count=payload.internships_count
    )

@app.post("/api/v1/ai/skill-gap")
def analyze_skill_gap(payload: SkillGapRequest):
    return gap_analyzer.analyze_gap(
        current_skills=payload.current_skills,
        target_role=payload.target_role
    )
