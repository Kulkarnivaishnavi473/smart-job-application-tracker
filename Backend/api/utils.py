import re
from collections import Counter
import fitz
from docx import Document

# =========================
# 🔥 TECH KEYWORDS (PHRASE SAFE)
# =========================
TECH_KEYWORDS = {
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "python": ["python"],
    "java": ["java"],
    "react": ["react", "reactjs"],
    "node.js": ["node.js", "nodejs"],
    "django": ["django"],
    "flask": ["flask"],
    "html": ["html"],
    "css": ["css"],
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb"],
    "rest api": ["rest api", "rest apis"],
    "git": ["git"],
    "github": ["github"],
    "docker": ["docker"],
    "aws": ["aws"],
    "azure": ["azure"],
    "gcp": ["gcp", "google cloud"],
    "data structures": ["data structures", "dsa"],
    "algorithms": ["algorithms"],
    "problem solving": ["problem solving"]
}

IMPORTANT_SKILLS = {"python", "sql", "django", "aws", "react", "node.js"}

STOPWORDS = {
    "the","is","are","was","were","be","been","being",
    "a","an","and","or","but","if","then","else",
    "for","to","of","in","on","with","by","at","from",
    "as","it","its","this","that","these","those"
}

GENERIC_WORDS = {
    "use","using","used","ability","knowledge",
    "understanding","strong","good","basic",
    "experience","familiar","required",
    "role","candidate","team","join","build",
    "develop","working","maintain",
    "work","system","process","application",
    "software","technical","engineering",
    "problem","responsibility","include",
    "includes","including","various"
}

# =========================
# FILE TEXT EXTRACTION
# =========================
def extract_resume_text(file_path):
    text = ""
    try:
        if file_path.endswith(".pdf"):
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()

        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"

        return text.strip()
    except:
        return ""

# =========================
# CLEAN TEXT
# =========================
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s+#.\-/]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def tokenize(text):
    return clean_text(text).split()

# =========================
# 🔥 EXTRACT TECH KEYWORDS (NO SPLITTING)
# =========================
def extract_tech_keywords(text):
    text = clean_text(text)
    found = set()

    for main, variations in TECH_KEYWORDS.items():
        for v in variations:
            pattern = r"\b" + re.escape(v) + r"\b"
            if re.search(pattern, text):
                found.add(main)

    return found

# =========================
# 🔥 CLEAN NORMAL WORDS
# =========================
def extract_clean_words(text):
    words = tokenize(text)

    clean_words = []
    for w in words:
        if (
            len(w) > 2 and
            w not in STOPWORDS and
            w not in GENERIC_WORDS and
            not w.isdigit()
        ):
            clean_words.append(w)

    return clean_words

# =========================
# 🔥 JD KEYWORDS (SMART)
# =========================
def extract_jd_keywords(job_description):
    text = clean_text(job_description)

    tech_keywords = extract_tech_keywords(text)

    words = extract_clean_words(text)
    counts = Counter(words)

    # keep only meaningful words (freq >= 2)
    normal_keywords = [w for w, c in counts.items() if c >= 2]

    return list(tech_keywords) + normal_keywords[:20]

# =========================
# 🔥 MATCHING + SCORING (ADVANCED)
# =========================
def keyword_match_score(resume_text, job_description):
    jd_keywords = extract_jd_keywords(job_description)

    resume_clean = clean_text(resume_text)
    resume_words = extract_clean_words(resume_clean)
    resume_counts = Counter(resume_words)
    resume_tech = extract_tech_keywords(resume_clean)

    matched = []
    missing = []

    weighted_score = 0
    total_weight = 0

    tech_total = len([k for k in jd_keywords if k in TECH_KEYWORDS])
    tech_matched = 0

    for keyword in jd_keywords:

        weight = 2 if keyword in IMPORTANT_SKILLS else 1
        total_weight += weight

        # TECH MATCH
        if keyword in TECH_KEYWORDS:
            if keyword in resume_tech:
                matched.append(keyword)
                weighted_score += weight
                tech_matched += 1
            else:
                missing.append(keyword)

        # NORMAL MATCH
        else:
            freq = resume_counts.get(keyword, 0)

            if freq > 0:
                matched.append(keyword)
                weighted_score += weight + min(freq, 2) * 0.3
            else:
                missing.append(keyword)

    matched = list(dict.fromkeys(matched))
    missing = [k for k in missing if k not in matched]

    keyword_score = (weighted_score / max(total_weight, 1)) * 100
    tech_score = (tech_matched / max(tech_total, 1)) * 100

    final_score = (keyword_score * 0.7) + (tech_score * 0.3)

    return {
        "keyword_score": round(keyword_score, 2),
        "tech_score": round(tech_score, 2),
        "ats_score": round(final_score, 2),
        "matched_keywords": matched[:15],
        "missing_keywords": missing[:15]
    }

# =========================
# 🔥 SEMANTIC SIMILARITY (LIGHT)
# =========================
def semantic_similarity(resume_text, job_description):
    resume_set = set(extract_clean_words(resume_text))
    jd_set = set(extract_clean_words(job_description))

    if not jd_set:
        return 0

    return (len(resume_set & jd_set) / len(jd_set)) * 100

# =========================
# 🔥 SUGGESTIONS (SMART)
# =========================
def generate_suggestions(score, missing):
    suggestions = []

    tech_missing = [k for k in missing if k in TECH_KEYWORDS]

    if tech_missing:
        suggestions.append(f"Add missing skills: {', '.join(tech_missing[:5])}")

    if "sql" in tech_missing:
        suggestions.append("Include database projects using SQL")

    if "django" in tech_missing or "flask" in tech_missing:
        suggestions.append("Add backend framework experience")

    if "aws" in tech_missing:
        suggestions.append("Mention cloud technologies like AWS")

    if score < 50:
        suggestions.append("Resume is weakly aligned. Add more relevant skills and projects")
    elif score < 75:
        suggestions.append("Improve keyword targeting and project descriptions")
    else:
        suggestions.append("Good match. Improve impact with measurable achievements")

    return suggestions

# =========================
# 🔥 FINAL ANALYSIS
# =========================
def analyze_resume_vs_job(resume_text, job_description):
    result = keyword_match_score(resume_text, job_description)

    similarity = semantic_similarity(resume_text, job_description)

    final_score = (result["ats_score"] * 0.8) + (similarity * 0.2)

    return {
        "final_score": round(final_score, 2),
        "keyword_score": result["keyword_score"],
        "tech_score": result["tech_score"],
        "semantic_similarity": round(similarity, 2),
        "matched_keywords": result["matched_keywords"],
        "missing_keywords": result["missing_keywords"],
        "suggestions": generate_suggestions(final_score, result["missing_keywords"])
    }