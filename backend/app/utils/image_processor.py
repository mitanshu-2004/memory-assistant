import io
from PIL import Image
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def extract_text_from_image(image_stream: io.BytesIO) -> str:
    try:
        import pytesseract
        
        image = Image.open(image_stream)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        text = pytesseract.image_to_string(image)
        
        return text.strip()
    except ImportError:
        logger.warning("pytesseract not installed. Cannot extract text from images.")
        return ""
    except Exception as e:
        logger.error(f"Failed to extract text from image: {e}")
        return ""

def create_thumbnail(image_stream: io.BytesIO, output_path: Path, size: tuple = (200, 200)):
    """Create a thumbnail from an image"""
    try:
        # Open the original image
        image = Image.open(image_stream)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Create thumbnail
        image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Save thumbnail
        image.save(output_path, 'JPEG', quality=85, optimize=True)
        
        return True
    except Exception as e:
        logger.error(f"Failed to create thumbnail: {e}")
        return False

def get_image_info(image_stream: io.BytesIO) -> dict:
    """Get basic information about an image"""
    try:
        image = Image.open(image_stream)
        
        return {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
            "size_bytes": image_stream.getvalue().__sizeof__()
        }
    except Exception as e:
        logger.error(f"Failed to get image info: {e}")
        return {}