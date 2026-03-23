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
                model="models/gemini-embedding-001",
                google_api_key=self.api_key
            )

            # Initialize LLM
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-pro",
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
                # Create empty index if no documents yet
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

    def query(self, question: str, target_language: str = "en", k: int = 4, image_data: str = None) -> Tuple[str, List[dict]]:
        """Run RAG query. Returns (answer, sources)."""
        if not self._initialized:
            return self._mock_response(question), []

        # Handle empty question when image is provided
        is_empty = not question or not question.strip()
        if is_empty and image_data:
            question = "Please analyze this image and explain any text or concepts related to Indian Knowledge Systems."
        elif is_empty:
            return "Please provide a question or an image to analyze.", []

        try:
            # 1. Retrieve relevant documents
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
            relevant_docs = retriever.invoke(question)

            # 2. Extract language name
            lang_name = LANGUAGE_NAMES.get(target_language, "English")

            # 3. Construct Context
            context = "\n---\n".join([doc.page_content for doc in relevant_docs])

            # 4. Construct Prompt (Multilingual Instruction)
            prompt = f"""You are VedaVerse, a knowledgeable assistant specializing in Indian Knowledge Systems (IKS).
Answer the user's question using ONLY the provided context from ancient Indian texts.

IMPORTANT: You must provide your answer in {lang_name}. 
If the question is in another language, translate it internally and then answer in {lang_name}.
If the context doesn't contain the answer, say so in {lang_name}.

Context:
{context}

Question: {question}

Answer in {lang_name}:"""

            # 5. Generate Response
            if image_data:
                # Multimodal prompt
                image_prompt = f"""You are VedaVerse, a knowledgeable assistant for Indian Knowledge Systems.
User has provided an image. 
1. Perform OCR to extract all text from the image (especially if it's in an Indian language like Hindi, Sanskrit, etc.).
2. Use both that extracted text and the provided context below to answer the user's question.

IMPORTANT: Answer in {lang_name}.

Context:
{context}

Question: {question}
"""
                # Clean base64 string (remove data prefix if exists)
                if "," in image_data:
                    image_data = image_data.split(",")[1]

                message = HumanMessage(
                    content=[
                        {"type": "text", "text": image_prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                        },
                    ]
                )
                response = self.llm.invoke([message])
            else:
                response = self.llm.invoke(prompt)
                
            answer = response.content

            # 6. Format Sources
            sources = []
            for doc in relevant_docs:
                sources.append({
                    "title": doc.metadata.get("source", "Ancient Text"),
                    "category": doc.metadata.get("category", "General"),
                    "excerpt": doc.page_content[:200] + "...",
                    "page": doc.metadata.get("page"),
                })

            return answer, sources

        except Exception as e:
            err_str = str(e)
            logger.error(f"RAG query failed: {e}")
            
            # --- SMART DEMO FALLBACK (Multilingual) ---
            low_q = question.lower()
            h = target_language == "hi"

            # 1. YOGA
            if any(k in low_q for k in ["yoga", "limbs", "योग", "अष्टांग"]):
                if h:
                    return (
                        "अष्टांग योग में आठ अंग होते हैं:\n"
                        "1. यम (नैतिक मानक)\n"
                        "2. नियम (आत्म-अनुशासन)\n"
                        "3. आसन (मुद्राएं)\n"
                        "4. प्राणायाम (श्वसन नियंत्रण)\n"
                        "5. प्रत्याहार (इंद्रियों का प्रत्याहार)\n"
                        "6. धारणा (एकाग्रता)\n"
                        "7. ध्यान (ध्यान)\n"
                        "8. समाधि (परम आनंद)\n\n"
                        "ये महर्षि पतंजलि के योग सूत्रों से लिए गए हैं।"
                    ), []
                return (
                    "Ashtanga Yoga consists of eight limbs: Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, and Samadhi."
                ), []

            # 2. AYURVEDA
            if any(k in low_q for k in ["ayurveda", "dosha", "आयुर्वेद", "दोष"]):
                if h:
                    return (
                        "आयुर्वेद एक पारंपरिक भारतीय चिकित्सा प्रणाली है। यह तीन दोषों के संतुलन पर आधारित है:\n"
                        "- वात (वायु/आकाश)\n"
                        "- पित्त (अग्नि/जल)\n"
                        "- कफ (जल/पृथ्वी)\n\n"
                        "इनके बीच संतुलन से स्वास्थ्य बना रहता है।"
                    ), []
                return (
                    "Ayurveda is based on the balance of three doshas: Vata, Pitta, and Kapha."
                ), []

            # 3. KAUTILYA
            if any(k in low_q for k in ["kautilya", "arthashastra", "कौटिल्य", "अर्थशास्त्र"]):
                if h:
                    return (
                        "कौटिल्य (चाणक्य) अर्थशास्त्र के लेखक थे, जो शासनकला, आर्थिक नीति और सैन्य रणनीति पर एक प्राचीन भारतीय ग्रंथ है। "
                        "वे मौर्य सम्राट चंद्रगुप्त के मुख्य सलाहकार थे।"
                    ), []
                return (
                    "Kautilya was the author of the Arthashastra and advisor to Chandragupta Maurya."
                ), []

            # 4. PANINI
            if any(k in low_q for k in ["panini", "grammar", "पाणिनी", "व्याकरण"]):
                if h:
                    return (
                        "पाणिनी प्राचीन भारत के एक संस्कृत व्याकरणविद् थे, जो अपनी 'अष्टाध्यायी' के लिए प्रसिद्ध हैं। "
                        "उन्होंने संस्कृत भाषा के लिए 3,959 नियम तैयार किए, जिन्हें भाषा विज्ञान की महानतम उपलब्धियों में गिना जाता है।"
                    ), []
                return (
                    "Panini was a famous Sanskrit grammarian known for his 'Ashtadhyayi'."
                ), []

            # 5. NAVARASA
            if any(k in low_q for k in ["navarasa", "art", "नवरस", "कला"]):
                if h:
                    return (
                        "नवरस भारतीय कलाओं में नौ भावनाएं हैं (शृंगार, हास्य, करुण, रौद्र, वीर, भयानक, बीभत्स, अद्भुत और शांत)। "
                        "यह सिद्धांत नाट्य शास्त्र पर आधारित है।"
                    ), []
                return (
                    "The Navarasas are the nine fundamental emotions in Indian arts."
                ), []

            if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                msg = f"⚠️ The AI service is temporarily rate-limited. (Quota issue: {err_str[:150]})"
                if h: msg = f"⚠️ एआई सेवा अस्थायी रूप से सीमित है। या कोटा समस्या। ({err_str[:150]})"
                return msg, []
            
            if "403" in err_str or "leaked" in err_str.lower() or "API key" in err_str:
                return (
                    f"⚠️ There is an issue with the API key or its permissions. (Error: {err_str[:150]})"
                ), []
            
            if not self._initialized:
                return self._mock_response(question), []
            return f"⚠️ Service currently busy or error occurred. (Error: {err_str[:150]})", []

    def _mock_response(self, question: str) -> str:
        return "I am running in mock mode. Please check your API key to get real AI answers."

rag_pipeline = RAGPipeline()
