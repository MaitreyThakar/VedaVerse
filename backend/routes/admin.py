from fastapi import APIRouter, HTTPException
from typing import List, Dict
from curated_data import get_all_curated, get_admin_stats

router = APIRouter()

@router.get("/stats")
async def fetch_admin_stats():
    """
    Fetch live metrics for the Admin Dashboard.
    """
    try:
        return get_admin_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/curation")
async def fetch_all_curation():
    """
    Fetch all curated corpora entries.
    """
    try:
        return get_all_curated()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/glossary")
async def fetch_full_glossary():
    """
    Fetch the entire glossary.
    """
    from curated_data import GLOSSARY
    return GLOSSARY
