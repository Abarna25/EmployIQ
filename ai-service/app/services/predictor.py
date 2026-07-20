import numpy as np
from typing import Dict, Any, List

class EmployabilityPredictor:
    def __init__(self):
        # Weights simulating trained XGBoost regressor model
        self.weights = {
            "cgpa": 25.0,
            "project_count": 15.0,
            "coding_rating": 20.0,
            "skill_count": 20.0,
            "internship_count": 20.0
        }

    def predict(
        self,
        cgpa: float,
        projects_count: int,
        coding_rating: int,
        skills_count: int,
        internships_count: int
    ) -> Dict[str, Any]:
        
        # Calculate feature scores (0 - 100 scale)
        norm_cgpa = min(100.0, (cgpa / 10.0) * 100.0)
        norm_proj = min(100.0, (projects_count / 5.0) * 100.0)
        norm_code = min(100.0, (coding_rating / 2000.0) * 100.0)
        norm_skill = min(100.0, (skills_count / 10.0) * 100.0)
        norm_intern = min(100.0, (internships_count / 2.0) * 100.0)

        overall_score = (
            norm_cgpa * 0.25 +
            norm_proj * 0.20 +
            norm_code * 0.25 +
            norm_skill * 0.15 +
            norm_intern * 0.15
        )

        overall_score = round(min(99.0, max(30.0, overall_score)), 1)

        # Categorize Tier
        if overall_score >= 82.0:
          predicted_tier = "Tier 1 (Core Product)"
        elif overall_score >= 68.0:
          predicted_tier = "Tier 2 (Enterprise IT / Fintech)"
        elif overall_score >= 50.0:
          predicted_tier = "Mass Recruiter"
        else:
          predicted_tier = "Needs Upskilling"

        # Explainable AI (SHAP-like factor contribution)
        shap_factors = {
            "positive_factors": [],
            "negative_factors": []
        }

        if cgpa >= 8.5:
          shap_factors["positive_factors"].append(f"Strong Academic Record (CGPA {cgpa}) +12.5%")
        else:
          shap_factors["negative_factors"].append(f"Academic CGPA ({cgpa}) could be improved -8.0%")

        if coding_rating >= 1600:
          shap_factors["positive_factors"].append(f"High Competitive Coding Rating ({coding_rating}) +15.0%")
        else:
          shap_factors["negative_factors"].append("Competitive Coding score below target threshold -10.0%")

        if projects_count >= 2:
          shap_factors["positive_factors"].append(f"Solid Practical Portfolio ({projects_count} projects) +10.0%")

        return {
            "overall_score": overall_score,
            "academic_score": round(norm_cgpa, 1),
            "project_score": round(norm_proj, 1),
            "coding_score": round(norm_code, 1),
            "technical_score": round(norm_skill, 1),
            "predicted_tier": predicted_tier,
            "shap_factors": shap_factors
        }

predictor_service = EmployabilityPredictor()
