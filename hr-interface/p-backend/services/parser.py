# services/parser.py
import re
import pdfplumber
import docx

# ---- TEXT EXTRACTORS ----
def extract_text(file_obj, filename):
    filename = filename.lower()

    try:
        file_obj.seek(0)
    except:
        pass

    # PDF
    if filename.endswith(".pdf"):
        try:
            with pdfplumber.open(file_obj) as pdf:
                pages = [page.extract_text() for page in pdf.pages]
                return "\n".join([p for p in pages if p])
        except:
            pass

    # DOCX
    if filename.endswith(".docx"):
        try:
            doc = docx.Document(file_obj)
            return "\n".join([p.text for p in doc.paragraphs])
        except:
            pass

    # Fallback – treat as text file
    try:
        data = file_obj.read()
        if isinstance(data, bytes):
            return data.decode("utf-8", errors="ignore")
        return str(data)
    except:
        return ""

# ---- FIELDS ----
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", re.I)
PHONE_RE = re.compile(r"\+?\d[\d\s\-]{7,15}")

SKILL_KEYWORDS = [
    "python", "java", "sql", "excel", "power bi", "tableau",
    "machine learning", "deep learning", "data analysis",
    "html", "css", "javascript", "flask", "fastapi",
    "pandas", "numpy", "nlp"
]

def parse_resume(file_obj, filename):
    text = extract_text(file_obj, filename) or ""

    email = None
    phone = None

    m = EMAIL_RE.search(text)
    if m: email = m.group(0)

    m = PHONE_RE.search(text)
    if m: phone = m.group(0)

    skills = []
    lower = text.lower()
    for kw in SKILL_KEYWORDS:
        if kw in lower:
            skills.append(kw)

    # Return parsed structured data
    return {
        "raw_text": text,
        "email": email,
        "phone": phone,
        "skills": skills
    }