import io
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def extract_text_from_file(file_content: bytes, mime_type: str) -> str:
    """Extract text from various file formats"""
    try:
        if "pdf" in mime_type:
            return extract_text_from_pdf(file_content)
        elif "text" in mime_type:
            return file_content.decode('utf-8', errors='ignore')
        elif "doc" in mime_type or "docx" in mime_type:
            return extract_text_from_docx(file_content)
        else:
            # Try to decode as text
            return file_content.decode('utf-8', errors='ignore')
    except Exception as e:
        logger.error(f"Failed to extract text from file: {e}")
        return ""

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF files"""
    try:
        import PyPDF2
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except ImportError:
        logger.warning("PyPDF2 not installed. Cannot extract PDF text.")
        return ""
    except Exception as e:
        logger.error(f"Failed to extract PDF text: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX files"""
    try:
        import docx
        doc_file = io.BytesIO(file_content)
        doc = docx.Document(doc_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text.strip()
    except ImportError:
        logger.warning("python-docx not installed. Cannot extract DOCX text.")
        return ""
    except Exception as e:
        logger.error(f"Failed to extract DOCX text: {e}")
        return ""