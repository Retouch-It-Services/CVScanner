from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import JSONResponse, FileResponse
from datetime import datetime, timedelta
from collections import Counter
from models.database import SessionLocal
from models.analysis import CandidateAnalysis
from services.matcher import embed_texts, cosine_sim
from services.parser import parse_resume
import docx, os, re
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch


router = APIRouter(prefix="/analyze", tags=["AI Resume Analyzer"])

print("🔍 AI Embedding Models Ready (via matcher.py)")


# EXPERIENCE EXTRACTION

def extract_experience(text: str) -> str:
    patterns = [
        r"(\d+\+?)\s*(?:years?|yrs?)\s*(?:of\s+)?experience",
        r"total\s+experience[:\s-]+(\d+\+?)",
        r"experience\s*[:\-]?\s*(\d+\+?)",
        r"having\s+(\d+\+?)",
        r"(\d+)\s*(?:years?|yrs?)\b",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m:
            return f"{m.group(1)} yrs"
    return "Not specified"


# SKILLS (OLD SYSTEM)

def extract_skills(text):
    keywords = [
        "python", "java", "sql", "excel", "power bi", "tableau",
        "machine learning", "deep learning", "data analysis",
        "html", "css", "javascript", "flask", "fastapi",
        "communication", "leadership", "pandas", "numpy", "nlp"
    ]
    lower = text.lower()
    return [s for s in keywords if s in lower]


# MATCHING

def calculate_match(resume_text, jd_text):
    embs = embed_texts([resume_text, jd_text], prefer=["nomic", "gemma"], combine="average")

    resume_emb = embs[0:1]
    jd_emb = embs[1:2]

    sim = float(cosine_sim(resume_emb, jd_emb)[0,0])

    score = (sim * 0.45 + 0.5) * 100
    return round(min(score, 99.9), 2)


# SKILL GAP

def analyze_gap(resume_text, jd_text):
    r_skills = set(extract_skills(resume_text))
    j_skills = set(extract_skills(jd_text))

    matched = list(r_skills & j_skills)
    missing = list(j_skills - r_skills)

    pct = round((len(matched) / len(j_skills)) * 100, 1) if j_skills else 0

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": pct
    }


# COVER LETTER

def generate_cover_letter(name, jd_text, skills):
    return (
        f"Dear Hiring Manager,\n\n"
        f"My name is {name}, and I am excited to apply for this position. "
        f"I bring strong experience in {', '.join(skills[:5])}. "
        f"I believe my background aligns well with the job requirements.\n\n"
        f"Sincerely,\n{name}"
    )


# MAIN ENDPOINT

@router.post("/")
async def analyze_resumes(
    resumes: list[UploadFile] = File(...),
    jd: UploadFile = File(...)
):
    db = SessionLocal()
    job_id = f"JD-{int(datetime.utcnow().timestamp())}"

    # ---- Parse JD ----
    jd_parsed = parse_resume(jd.file, jd.filename)
    jd_text = jd_parsed["raw_text"]

    candidates = []

    for file in resumes:

        # ---- Parse Resume ----
        parsed = parse_resume(file.file, file.filename)
        resume_text = parsed["raw_text"]

        name = file.filename.replace(".docx", "").replace(".pdf", "")
        experience = extract_experience(resume_text)
        skills = extract_skills(resume_text)

        match = calculate_match(resume_text, jd_text)
        gap = analyze_gap(resume_text, jd_text)

        fit = (
            "Strong Fit ✅" if match >= 80
            else "Moderate Fit ⚙️" if match >= 60
            else "Low Fit ❌"
        )

        cover = generate_cover_letter(name, jd_text, skills)

        # ---- DB Store ----
        entry = CandidateAnalysis(
            job_id=job_id,
            name=name,
            experience=experience,
            skills=", ".join(skills),
            matched_skills=", ".join(gap["matched"]),
            missing_skills=", ".join(gap["missing"]),
            match_score=match,
            skill_match_percent=gap["match_percentage"],
            fit_status=fit,
            cover_letter=cover,
            resume_name=file.filename,
        )
        db.add(entry)

        # ---- Return to frontend ----
        candidates.append({
            "name": name,
            "experience": experience,
            "match": match,
            "fit_status": fit,
            "skills": skills,
            "matched_skills": gap["matched"],
            "missing_skills": gap["missing"],
            "skill_match_percent": gap["match_percentage"],
            "cover_letter": cover,
            "parsed_resume": parsed   # parsed details returned
        })

    db.commit()
    db.close()

    return {
        "job_id": job_id,
        "parsed_jd": jd_parsed,   # JD parsed details returned
        "candidates": candidates,
    }


# REPORTS (unchanged)

@router.get("/reports")
def get_analysis_report(
    from_date: str = Query(None),
    to_date: str = Query(None),
    job_role: str = Query("all")
):
    db = SessionLocal()
    query = db.query(CandidateAnalysis)

    if from_date:
        query = query.filter(CandidateAnalysis.analyzed_at >= datetime.strptime(from_date, "%Y-%m-%d"))

    if to_date:
        to_dt = datetime.strptime(to_date, "%Y-%m-%d") + timedelta(days=1)
        query = query.filter(CandidateAnalysis.analyzed_at < to_dt)

    if job_role != "all":
        query = query.filter(CandidateAnalysis.job_id.ilike(f"%{job_role}%"))

    records = query.all()
    db.close()

    if not records:
        return {"message": "No records found"}

    total = len(records)
    avg = round(sum(r.match_score for r in records) / total, 2)
    top = max(r.match_score for r in records)

    all_skills = []
    for r in records:
        if r.skills:
            all_skills.extend([s.strip().lower() for s in r.skills.split(",")])

    top_skills = Counter(all_skills).most_common(5)

    return {
        "summary": {
            "total_resumes": total,
            "avg_match": avg,
            "top_match": top,
        },
        "skills": top_skills,
        "pipeline": {
            "Applied": total,
            "Shortlisted": total // 2,
            "Interviewed": total // 3,
            "Hired": total // 5,
        },
    }


# PDF DOWNLOAD (unchanged)

@router.get("/download-report")
def download_analysis_report():
    db = SessionLocal()
    records = db.query(CandidateAnalysis).all()
    db.close()

    if not records:
        return {"error": "No analysis data"}

    os.makedirs("reports", exist_ok=True)
    path = "reports/report.pdf"

    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 18)
    c.drawString(1 * inch, height - 1 * inch, "AI Resume Analysis Report")

    total = len(records)
    top = max(r.match_score for r in records)
    avg = round(sum(r.match_score for r in records) / total, 2)

    c.setFont("Helvetica", 12)
    c.drawString(1 * inch, height - 1.6 * inch, f"Total Resumes: {total}")
    c.drawString(1 * inch, height - 1.9 * inch, f"Top Match: {top}%")
    c.drawString(1 * inch, height - 2.2 * inch, f"Average Fit: {avg}%")

    y = height - 3 * inch
    c.setFont("Helvetica", 10)

    for i, r in enumerate(records, start=1):
        line = f"{i}. {r.name} | Exp: {r.experience} | Match: {r.match_score}%"
        c.drawString(1 * inch, y, line)
        y -= 0.25 * inch
        if y < 1 * inch:
            c.showPage()
            y = height - 1 * inch
            c.setFont("Helvetica", 10)

    c.save()

    return FileResponse(path, filename="Resume_Report.pdf")


from fastapi import HTTPException

@router.get("/download-resume")
def download_resume(filename: str):
    file_path = os.path.join("uploads", filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume not found")

    return FileResponse(path=file_path, filename=filename, media_type="application/octet-stream")

