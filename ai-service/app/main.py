from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app.services.parser import parser_service
from app.services.predictor import predictor_service
from app.services.similarity import gap_analyzer
from app.services.intelligence import intelligence_service

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

@app.post("/predict/employability")
async def predict_employability(payload: dict):
    return intelligence_service.predict_employability(payload)

@app.post("/predict/skill-gap")
async def predict_skill_gap(payload: dict):
    return intelligence_service.predict_skill_gap(payload)

@app.post("/predict/semantic-search")
async def predict_semantic_search(payload: dict):
    return intelligence_service.predict_semantic_search(payload)

@app.post("/predict/rank-candidates")
async def rank_candidates(payload: dict):
    return intelligence_service.rank_candidates(payload)

@app.post("/predict/salary")
def predict_salary(payload: dict):
    return intelligence_service.predict_salary(payload)

@app.post("/predict/roadmap")
def predict_roadmap(payload: dict):
    return intelligence_service.predict_roadmap(payload)

@app.post("/predict/interview-readiness")
def predict_interview_readiness(payload: dict):
    return intelligence_service.predict_interview_readiness(payload)

@app.post("/predict/eligibility")
def predict_eligibility(payload: dict):
    return intelligence_service.predict_eligibility(payload)
