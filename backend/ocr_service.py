import pytesseract
from PIL import Image
import io
import base64
import logging
import os

logger = logging.getLogger(__name__)

# Try to find Tesseract-OCR on Windows
TESSERACT_CMD = r'C:\Users\ratho\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
if os.path.exists(TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

def extract_text_from_image(base64_image: str) -> str:
    """
    Local OCR using pytesseract.
    """
    try:
        # 1. Clean base64 string
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
        
        # 2. Decode image
        image_data = base64.b64decode(base64_image)
        img = Image.open(io.BytesIO(image_data))
        
        # 3. Extract text (OCR) with TOUT
        # We try to use a timeout if possible, but pytesseract doesn't have a direct timeout param.
        # So we just ensure we return quickly if config is missing.
        if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
            # Fallback check for system path
            import shutil
            if not shutil.which("tesseract"):
                return "[Error: Tesseract-OCR not installed on system. Skipping local OCR.]"
        
        text = pytesseract.image_to_string(img, lang='eng+hin')
        
        return text.strip()
    except Exception as e:
        logger.error(f"Local OCR failed: {e}")
        return f"[Error: Local OCR failed: {str(e)[:50]}]"
