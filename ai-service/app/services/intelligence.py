from typing import Dict, Any, List
import random

class IntelligenceService:
    def predict_salary(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        # Heuristic based on CGPA and skills count
        cgpa = profile_data.get('currentCgpa', 0)
        skills_count = len(profile_data.get('studentSkills', []))
        
        base_salary = 400000 # 4 LPA base
        
        # CGPA multiplier
        if cgpa >= 9.0:
            base_salary += 300000
        elif cgpa >= 8.0:
            base_salary += 150000
            
        # Skills multiplier
        base_salary += (skills_count * 10000)
        
        return {
            "predictedMin": int(base_salary * 0.9),
            "predictedMax": int(base_salary * 1.2),
            "confidenceScore": 0.85,
            "factors": {
                "cgpa_impact": "High",
                "skills_impact": "Medium",
                "market_trend": "Positive"
            }
        }

    def predict_interview_readiness(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        projects_count = len(profile_data.get('projects', []))
        coding_profiles = profile_data.get('codingProfiles', [])
        skills = [s.get('skill', {}).get('name', 'General') for s in profile_data.get('studentSkills', [])]
        
        base_score = 40.0
        base_score += min(projects_count * 10, 30)
        base_score += min(len(coding_profiles) * 15, 30)
        
        mock_questions = [
            {"topic": "System Design", "question": "How would you design a scalable URL shortener?"},
            {"topic": "Behavioral", "question": "Tell me about a time you had to learn a new technology quickly."},
        ]
        
        if "React.js" in skills:
            mock_questions.append({"topic": "React.js", "question": "Explain the virtual DOM and how React reconciliation works."})
        if "Python" in skills:
            mock_questions.append({"topic": "Python", "question": "What is the GIL in Python and how does it affect concurrency?"})
            
        return {
            "readinessScore": min(base_score, 100.0),
            "mockInterviewScore": 75.0, # Simulated previous mock score
            "strengths": ["Project portfolio", "Active coding profiles"] if projects_count > 0 else ["Needs more projects"],
            "improvementAreas": ["System Design", "Advanced Data Structures"],
            "mockQuestions": mock_questions
        }

    def predict_roadmap(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        # Generate a mock 4-week roadmap based on missing skills
        target_role = "Software Development Engineer"
        
        steps = [
            {"week": 1, "topic": "Data Structures & Algorithms", "status": "pending"},
            {"week": 2, "topic": "System Design Basics", "status": "pending"},
            {"week": 3, "topic": "Advanced React / Node.js", "status": "pending"},
            {"week": 4, "topic": "Mock Interviews & Resume Polish", "status": "pending"},
        ]
        
        return {
            "targetRole": target_role,
            "roadmapSteps": steps
        }

    def predict_eligibility(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        cgpa = profile_data.get('currentCgpa', 0)
        
        companies = [
            {"name": "Google", "eligibility": cgpa >= 8.5, "missing_skills": ["System Design"]},
            {"name": "Amazon", "eligibility": cgpa >= 8.0, "missing_skills": ["AWS"]},
            {"name": "Microsoft", "eligibility": cgpa >= 8.0, "missing_skills": ["C#", ".NET"]},
            {"name": "TCS", "eligibility": cgpa >= 6.0, "missing_skills": []}
        ]
        
        return {
            "eligible_companies": [c for c in companies if c["eligibility"]],
            "ineligible_companies": [c for c in companies if not c["eligibility"]]
        }
        
    def predict_employability(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        cgpa = profile_data.get('currentCgpa', 0)
        skills_count = len(profile_data.get('studentSkills', []))
        
        overall = min((cgpa * 10) + (skills_count * 2), 100)
        
        return {
            "overallScore": overall,
            "technicalScore": min(overall * 1.1, 100),
            "projectScore": min(overall * 0.9, 100),
            "codingScore": min(overall * 0.8, 100),
            "academicScore": cgpa * 10,
            "predictedTier": "Tier 1" if overall >= 85 else "Tier 2",
            "shapFactors": {
                "positive": ["High CGPA", "Multiple Projects"],
                "negative": ["Lack of cloud skills"]
            }
        }
        
    def predict_skill_gap(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "targetRole": "Software Engineer",
            "matchingPercentage": 75.5,
            "missingSkills": ["AWS", "System Design", "Docker"],
            "recommendedCourses": [
                {"name": "AWS Certified Solutions Architect", "url": "https://aws.amazon.com/"},
                {"name": "Grokking the System Design Interview", "url": "https://educative.io/"}
            ]
        }

    def predict_semantic_search(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        query = payload.get('query', '').lower()
        candidates = payload.get('candidates', [])
        
        # Mock semantic search: just boost scores if query words appear in bio or skills
        query_words = set(query.split())
        results = []
        for c in candidates:
            score = 0
            # Check bio
            bio = str(c.get('bio', '')).lower()
            if any(w in bio for w in query_words):
                score += 30
            # Check skills
            skills = [s.get('skill', {}).get('name', '').lower() for s in c.get('studentSkills', [])]
            if any(w in [sk.lower() for sk in skills] for w in query_words):
                score += 50
                
            results.append({
                "candidateId": c.get('id'),
                "semanticScore": score,
                "reason": "Matches semantic search terms" if score > 0 else "Low relevance"
            })
            
        results.sort(key=lambda x: x['semanticScore'], reverse=True)
        return {"results": results}

    def rank_candidates(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        job_requirements = payload.get('requiredSkills', [])
        candidates = payload.get('candidates', [])
        
        req_skills = set(s.lower() for s in job_requirements)
        
        results = []
        for c in candidates:
            # Check skills overlap
            skills = set(s.get('skill', {}).get('name', '').lower() for s in c.get('studentSkills', []))
            overlap = req_skills.intersection(skills)
            
            match_percentage = (len(overlap) / len(req_skills) * 100) if req_skills else 100.0
            
            results.append({
                "candidateId": c.get('id'),
                "matchPercentage": min(match_percentage, 100.0),
                "matchedSkills": list(overlap),
                "reason": f"Matches {len(overlap)} out of {len(req_skills)} required skills."
            })
            
        results.sort(key=lambda x: x['matchPercentage'], reverse=True)
        return {"rankedResults": results}

intelligence_service = IntelligenceService()
