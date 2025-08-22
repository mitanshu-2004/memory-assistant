from bs4 import BeautifulSoup
import re
from typing import Optional
import requests

def extract_text_from_url(url: str) -> dict:
    """Fetch a webpage and extract its text + title"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        html_content = response.text

        extracted_text = extract_text_from_html(html_content)
        title = extract_title_from_html(html_content)

        return {
            "title": title or "Untitled Page",
            "extracted_text": extracted_text
        }
    except Exception as e:
        raise Exception(f"Failed to fetch or extract from URL {url}: {str(e)}")


def extract_text_from_html(html_content: str) -> str:
    """Extract clean text from HTML content"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Remove excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()
    
    except Exception as e:
        raise Exception(f"Failed to extract text from HTML: {str(e)}")

def extract_title_from_html(html_content: str) -> Optional[str]:
    """Extract title from HTML content"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Try to get title from <title> tag
        title_tag = soup.find('title')
        if title_tag and title_tag.string:
            return title_tag.string.strip()
        
        # Try to get title from h1 tag
        h1_tag = soup.find('h1')
        if h1_tag and h1_tag.get_text():
            return h1_tag.get_text().strip()
        
        # Try to get title from meta property="og:title"
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content'].strip()
        
        return None
    
    except Exception:
        return None