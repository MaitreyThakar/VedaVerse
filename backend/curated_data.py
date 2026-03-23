import logging
from sqlalchemy.orm import Session
from database import SessionLocal, CuratedCorpusDB, GlossaryTermDB

logger = logging.getLogger(__name__)

def seed_db():
    """Seed the database with initial expert data if empty."""
    db = SessionLocal()
    try:
        if db.query(CuratedCorpusDB).count() == 0:
            initial_data = [
                CuratedCorpusDB(
                    sanskrit="अथ योगानुशासनम्",
                    english="Now, the instruction of Yoga begins.",
                    gujarati="હવે યોગનું અનુશાસન શરૂ થાય છે.",
                    explanation_gu="આ સૂત્રનો અર્થ છે કે હવે યોગના અભ્યાસની શરૂઆત થાય છે. અનુશાસન એટલે કે સંપૂર્ણ શિસ્ત સાથે જ્ઞાન મેળવવું.",
                    category="Yoga",
                    status="Validated",
                    author="Dr. Sharma",
                    is_curated=True
                ),
                CuratedCorpusDB(
                    sanskrit="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
                    english="You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
                    gujarati="તારો અધિકાર ફક્ત કર્મ કરવામાં છે, તેના ફળમાં ક્યારેય નહીં.",
                    explanation_gu="કર્મયોગનો આ પાયાનો સિદ્ધાંત છે. મનુષ્યે ફળની ચિંતા કર્યા વગર પોતાનું કર્તવ્ય નિષ્ઠાપૂર્વક નિભાવવું જોઈએ.",
                    category="Philosophy",
                    status="Validated",
                    author="Expert AI",
                    is_curated=True
                )
            ]
            db.add_all(initial_data)
            db.commit()
            logger.info("Database seeded with initial curated corpora.")

        if db.query(GlossaryTermDB).count() == 0:
            glossary_data = [
                GlossaryTermDB(term="अठ", transliteration="Atha", gujarati="હવે / પ્રારંભ", context="Indicates the beginning of a sacred text."),
                GlossaryTermDB(term="अनुशासनम्", transliteration="Anushasanam", gujarati="શિસ્તબદ્ધ શિક્ષણ / સૂચના", context="Instruction following a tradition."),
                GlossaryTermDB(term="योग", transliteration="Yoga", gujarati="જોડાણ / ચિત્તવૃત્તિનો નિરોધ", context="Union of mind and soul.")
            ]
            db.add_all(glossary_data)
            db.commit()
            logger.info("Database seeded with glossary terms.")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

def get_all_curated():
    db = SessionLocal()
    try:
        return db.query(CuratedCorpusDB).all()
    finally:
        db.close()

def get_admin_stats():
    db = SessionLocal()
    try:
        total = db.query(CuratedCorpusDB).count()
        validated = db.query(CuratedCorpusDB).filter(CuratedCorpusDB.status == "Validated").count()
        terms = db.query(GlossaryTermDB).count()
        
        return {
            "totalCorpora": f"{total:,}",
            "expertValidated": f"{int((validated/total)*100)}%" if total > 0 else "0%",
            "glossaryTerms": f"{terms}",
            "retrieverAccuracy": "94.2%" # Mocked performance metric
        }
    finally:
        db.close()

def get_curated_match(query: str, language: str = "gu"):
    db = SessionLocal()
    try:
        query_lower = query.lower()
        # Fetch only curated entries
        entries = db.query(CuratedCorpusDB).filter(CuratedCorpusDB.is_curated == True).all()
        for entry in entries:
            sanskrit_match = query_lower in entry.sanskrit.lower()
            english_match = entry.english and any(word.lower() in query_lower for word in entry.english.split())
            if sanskrit_match or english_match:
                return {
                    "sanskrit": entry.sanskrit,
                    "english": entry.english,
                    "gujarati": entry.gujarati,
                    "explanation_gu": entry.explanation_gu
                }
        return None
    finally:
        db.close()

def get_glossary_terms(text: str):
    db = SessionLocal()
    try:
        found = {}
        terms = db.query(GlossaryTermDB).all()
        for t in terms:
            if t.term in text:
                found[t.term] = {
                    "transliteration": t.transliteration,
                    "gujarati": t.gujarati,
                    "context": t.context
                }
        return found
    finally:
        db.close()
