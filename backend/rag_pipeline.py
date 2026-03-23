import os
import logging
from typing import List, Tuple
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

FAISS_PATH = os.path.join(os.path.dirname(__file__), "data", "faiss_index")

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "bn": "Bengali",
    "te": "Telugu",
    "kn": "Kannada",
    "mr": "Marathi",
    "gu": "Gujarati",
}

class RAGPipeline:
    def __init__(self):
        self._initialized = False
        self.vectorstore = None
        self.embeddings = None
        self.llm = None
        self.api_key = None

    def initialize(self):
        """Initialize the RAG pipeline."""
        if self._initialized:
            return

        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment")
            return

        try:
            # Initialize Embeddings
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=self.api_key
            )

            # Initialize LLM
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=self.api_key,
                temperature=0.3,
            )

            # Load or Create Vector Store
            if os.path.exists(FAISS_PATH):
                self.vectorstore = FAISS.load_local(
                    str(FAISS_PATH), 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info("Loaded existing FAISS index")
            else:
                texts = ["VedaVerse is a project for Indian Knowledge Systems."]
                self.vectorstore = FAISS.from_texts(texts, self.embeddings)
                os.makedirs(os.path.dirname(FAISS_PATH), exist_ok=True)
                self.vectorstore.save_local(str(FAISS_PATH))
                logger.info("Created new FAISS index")

            self._initialized = True
            logger.info("RAG pipeline initialized successfully")

        except Exception as e:
            logger.error(f"RAG initialization failed: {e}")
            self._initialized = False

    def query(self, question: str, target_language: str = "en", k: int = 4, image_data: str = None) -> Tuple[str, List[dict], List[dict], bool]:
        """Run RAG query. Returns (answer, sources, glossary, is_curated)."""
        if not self._initialized:
            return self._mock_response(question), [], [], False

        is_empty = not question or not question.strip()
        if is_empty and image_data:
            question = "Analyze this image for Indian Knowledge Systems."
        elif is_empty:
            return "Please provide a question.", [], [], False

        from curated_data import get_curated_match, get_glossary_terms
        curated_match = get_curated_match(question, target_language)

        try:
            # 1. Retrieve
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
            relevant_docs = retriever.invoke(question)
            lang_name = LANGUAGE_NAMES.get(target_language, "English")
            context = "\n---\n".join([doc.page_content for doc in relevant_docs])
            
            if curated_match:
                context = f"EXPERT CURATED:\nSanskrit: {curated_match['sanskrit']}\nTranslation: {curated_match.get(target_language, curated_match['english'])}\n\n" + context

            # 2. Prompt
            prompt = f"""You are VedaVerse assistant. Answer in {lang_name}.
{f"Special Gujarati Verse-level explanation required if Sanskrit is found." if target_language == "gu" else ""}
Context: {context}
Question: {question}"""

            # 3. Generate
            if image_data:
                if "," in image_data: image_data = image_data.split(",")[1]
                message = HumanMessage(content=[{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}])
                response = self.llm.invoke([message])
            else:
                response = self.llm.invoke(prompt)
                
            answer = response.content

            # 4. Result Formatting
            is_curated = curated_match is not None
            glossary_raw = get_glossary_terms(answer + (curated_match["sanskrit"] if is_curated else ""))
            glossary = []
            for term, data in glossary_raw.items():
                glossary.append({"term": term, "transliteration": data["transliteration"], "gujarati": data["gujarati"], "context": data["context"]})

            sources = []
            for doc in relevant_docs:
                sources.append({"title": doc.metadata.get("source", "Ancient Text"), "category": doc.metadata.get("category", "General"), "excerpt": doc.page_content[:200], "page": doc.metadata.get("page")})

            return answer, sources, glossary, is_curated

        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            return f"Service busy: {str(e)[:100]}", [], [], False

    def _mock_response(self, question):
        return "VedaVerse is initializing. Please wait."

rag_pipeline = RAGPipeline()
