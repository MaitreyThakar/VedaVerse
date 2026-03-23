from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class Language(str, Enum):
    english = "en"
    hindi = "hi"
    tamil = "ta"
    bengali = "bn"
    telugu = "te"
    kannada = "kn"
    marathi = "mr"
    gujarati = "gu"


class AskRequest(BaseModel):
    query: str = Field("", max_length=1000, description="User's question")
    language: Language = Field(default=Language.english, description="Response language")
    session_id: Optional[str] = Field(default=None, description="Chat session ID")
    image_data: Optional[str] = Field(default=None, description="Base64 encoded image data")


class Source(BaseModel):
    title: str
    category: str
    excerpt: str
    page: Optional[int] = None


class AskResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    language: str
    translated: bool = False
    session_id: Optional[str] = None


class IngestResponse(BaseModel):
    success: bool
    message: str
    chunks_added: int = 0
    filename: str


class GraphNode(BaseModel):
    id: str
    label: str
    category: str
    description: str
    size: int = 10


class GraphEdge(BaseModel):
    source: str
    target: str
    label: str
    strength: float = 0.5


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class TextEntry(BaseModel):
    id: str
    title: str
    original_title: str
    category: str
    language: str
    era: str
    description: str
    tags: List[str]


class HeritageSubmission(BaseModel):
    title: str = Field(..., min_length=3)
    category: str
    language: str
    region: str
    description: str = Field(..., min_length=50)
    contributor_name: str
    contributor_email: str
    knowledge_text: str = Field(..., min_length=100)


class HeritageResponse(BaseModel):
    success: bool
    message: str
    submission_id: str


class OCRRequest(BaseModel):
    image_data: str


class OCRResponse(BaseModel):
    text: str
    success: bool
    message: Optional[str] = None
