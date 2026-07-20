import re
from typing import Dict, List, Any

class ResumeParser:
    def __init__(self):
        self.skill_keywords = [
            "python", "javascript", "typescript", "react", "node.js", "express",
            "postgresql", "mongodb", "docker", "kubernetes", "aws", "fastapi",
            "machine learning", "deep learning", "pytorch", "tensorflow", "git",
            "data structures", "algorithms", "system design", "redis", "graphql"
        ]

    def parse_text(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        extracted_skills = [skill for skill in self.skill_keywords if skill in text_lower]
        
        # Regex for email, phone, and links
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        phone_match = re.search(r'\+?\d[\d -]{8,}\d', text)
        
        # Estimate ATS Score based on skill coverage & structure
        ats_score = min(98.0, max(45.0, len(extracted_skills) * 8.5 + 40.0))

        return {
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
            "skills": extracted_skills,
            "ats_score": round(ats_score, 1),
            "parsed_character_count": len(text)
        }

parser_service = ResumeParser()
