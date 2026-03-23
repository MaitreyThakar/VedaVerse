"""
Translation module for VedaVerse
Uses Google Generative AI for multilingual support across Indian languages
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

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

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class TranslationService:
    def __init__(self):
        self._client = None
        self.api_key = None

    def _get_client(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self._client is None and self.api_key and GENAI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self._client = genai.GenerativeModel("gemini-1.5-flash")
        return self._client

    def translate_to_english(self, text: str, source_language: str) -> str:
        """Translate user query to English for RAG retrieval."""
        if source_language == "en":
            return text
        client = self._get_client()
        if not client:
            return text  # fallback: pass original
        try:
            lang_name = LANGUAGE_NAMES.get(source_language, source_language)
            prompt = f"Translate the following {lang_name} text to English. Return ONLY the translated text, nothing else:\n\n{text}"
            response = client.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Translation to English failed: {e}")
            return text

    def translate_from_english(self, text: str, target_language: str) -> str:
        """Translate English response to target language."""
        if target_language == "en":
            return text
        client = self._get_client()
        if not client:
            return text  # fallback: return English
        try:
            lang_name = LANGUAGE_NAMES.get(target_language, target_language)
            prompt = (
                f"Translate the following English text to {lang_name}. "
                f"Preserve any technical terms and Sanskrit words as-is. "
                f"Return ONLY the translated text:\n\n{text}"
            )
            response = client.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Translation from English failed: {e}")
            return text


translation_service = TranslationService()
