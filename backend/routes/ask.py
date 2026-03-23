from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models import AskRequest, AskResponse, OCRRequest, OCRResponse
from rag_pipeline import rag_pipeline
from ocr_service import extract_text_from_image

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
async def ask_vedaverse(request: AskRequest):
    """
    Multilingual Question Answering via RAG.
    """
    language = request.language.value  # e.g., "en", "hi", "bn"

    # Get answer directly from RAG (the prompt handles the multilingual translation)
    try:
        answer, sources_raw = rag_pipeline.query(
            request.query, 
            target_language=language,
            image_data=request.image_data
        )
    except Exception as e:
        # Fallback to English mock if everything fails
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

    # Format sources for response
    sources = []
    for src in sources_raw:
        sources.append({
            "title": src.get("title", "Document"),
            "category": src.get("category", "General"),
            "excerpt": src.get("excerpt", ""),
            "page": src.get("page", 1)
        })

    return AskResponse(
        answer=answer,
        sources=sources,
        language=language
    )

@router.post("/ocr", response_model=OCRResponse)
async def perform_ocr(request: OCRRequest):
    """
    Local OCR endpoint.
    """
    try:
        text = extract_text_from_image(request.image_data)
        if not text or "[Error" in text:
            return OCRResponse(text="", success=False, message=text)
        return OCRResponse(text=text, success=True)
    except Exception as e:
        return OCRResponse(text="", success=False, message=str(e))
