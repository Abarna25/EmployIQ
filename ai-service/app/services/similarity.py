from typing import List, Dict, Any

class SkillGapAnalyzer:
    def __init__(self):
        self.role_requirements = {
            "Full Stack Developer": ["React.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST API", "Git"],
            "AI / ML Engineer": ["Python", "PyTorch", "TensorFlow", "FastAPI", "Pandas", "Scikit-Learn", "Vector Databases"],
            "DevOps / Cloud Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Python"],
            "Data Engineer": ["Python", "SQL", "Apache Spark", "Kafka", "PostgreSQL", "Airflow", "Data Warehousing"]
        }

    def analyze_gap(self, current_skills: List[str], target_role: str) -> Dict[str, Any]:
        required = self.role_requirements.get(target_role, ["Python", "React.js", "SQL", "Git"])
        
        current_normalized = [s.lower().strip() for s in current_skills]
        
        matched_skills = [s for s in required if s.lower().strip() in current_normalized]
        missing_skills = [s for s in required if s.lower().strip() not in current_normalized]
        
        match_percentage = round((len(matched_skills) / max(1, len(required))) * 100.0, 1)

        recommended_courses = [
            {"title": f"Mastering {skill} for Enterprise Applications", "provider": "Coursera / Udemy", "estimated_hours": 15}
            for skill in missing_skills
        ]

        return {
            "target_role": target_role,
            "matching_percentage": match_percentage,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "recommended_courses": recommended_courses
        }

gap_analyzer = SkillGapAnalyzer()
