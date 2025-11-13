import re

def extract_skills(text: str):
    """Extract common skills from text."""
    skills = [
        "Python", "Java", "SQL", "Machine Learning", "Deep Learning", "Data Science",
        "Pandas", "NumPy", "TensorFlow", "Keras", "Excel", "Power BI", "AWS", "Azure",
        "React", "Node.js", "HTML", "CSS", "C++", "Leadership", "Communication",
        "NLP", "Docker", "Flask", "Django", "Git", "Tableau"
    ]
    found = [s for s in skills if re.search(rf"\b{s}\b", text, re.IGNORECASE)]
    return list(set(found))


def analyze_skill_gap(resume_text: str, jd_text: str):
    """Compare skills in resume vs JD."""
    resume_skills = set(extract_skills(resume_text))
    jd_skills = set(extract_skills(jd_text))

    matched = sorted(list(resume_skills & jd_skills))
    missing = sorted(list(jd_skills - resume_skills))

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": round((len(matched) / len(jd_skills) * 100), 2) if jd_skills else 0
    }
