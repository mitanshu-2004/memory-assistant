"""
AI Processing Module

This module handles all AI-related functionality including:
- Text embeddings generation using sentence transformers
- LLM-based text processing (summaries, titles, tags, categories)
- Metadata extraction and content analysis
- Fallback strategies for when AI models are unavailable

The module uses a local Phi-3 model for text generation and sentence-transformers
for embeddings, providing privacy-focused AI capabilities.
"""

from sentence_transformers import SentenceTransformer
from llama_cpp import Llama
import os
from pathlib import Path
import json
import re
from typing import Optional, List, Dict, Any
import logging
from functools import lru_cache

from app.config import get_model_path, settings

# Configure logging
logger = logging.getLogger(__name__)

# --- Embedding Model Setup ---
@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Lazy load embedding model with caching.
    
    Returns:
        SentenceTransformer: The embedding model instance
    """
    return SentenceTransformer(settings.embedding_model)

def generate_embedding(text: str) -> List[float]:
    """
    Generate embeddings with optimized preprocessing.
    
    Args:
        text: Input text to generate embeddings for
        
    Returns:
        List[float]: Embedding vector
    """
    # Clean and normalize text
    cleaned_text = re.sub(r'\s+', ' ', text.strip())
    if not cleaned_text:
        return get_embedding_model().encode("", convert_to_tensor=False)
    
    # Truncate if too long (model limit is ~512 tokens)
    if len(cleaned_text) > 2048:  # Conservative character limit
        cleaned_text = cleaned_text[:2048]
    
    return get_embedding_model().encode(cleaned_text, convert_to_tensor=False)

def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts efficiently"""
    if not texts:
        return []
    
    # Clean texts
    cleaned_texts = [re.sub(r'\s+', ' ', text.strip())[:2048] for text in texts]
    
    # Batch generate
    model = get_embedding_model()
    embeddings = model.encode(cleaned_texts, convert_to_tensor=False, batch_size=32)
    
    return [emb.tolist() for emb in embeddings]

MODEL_PATH = get_model_path()

llm = None

def initialize_llm():
    """Initialize LLM with optimal settings"""
    global llm
    if MODEL_PATH.exists():
        try:
            llm = Llama(
                model_path=str(MODEL_PATH), 
                n_ctx=4096, 
                n_gpu_layers=-1,  # Use GPU if available
                n_threads=os.cpu_count() // 2,  # Optimize thread usage
                verbose=False,
                use_mlock=True,  # Keep model in memory
                n_batch=512  # Optimize batch size
            )
            logger.info("LLM loaded successfully with optimized settings.")
            return True
        except Exception as e:
            logger.error(f"Failed to load LLM: {e}")
            llm = None
            return False
    else:
        logger.error(f"Model file not found at: {MODEL_PATH}")
        return False

# Initialize on import
llm_available = initialize_llm()

def _preprocess_text(text: str, max_length: int) -> str:
    """Common text preprocessing with smart truncation"""
    # Remove excessive whitespace and normalize
    cleaned = re.sub(r'\s+', ' ', text.strip())
    
    if len(cleaned) <= max_length:
        return cleaned
    
    # Smart truncation - try to end at sentence boundary
    truncated = cleaned[:max_length]
    last_sentence = truncated.rfind('.')
    last_paragraph = truncated.rfind('\n')
    
    # Use sentence boundary if within reasonable range
    if last_sentence > max_length * 0.8:
        return truncated[:last_sentence + 1]
    elif last_paragraph > max_length * 0.8:
        return truncated[:last_paragraph]
    else:
        return truncated

def _llm_generate(prompt: str, max_tokens: int, temperature: float, stop_tokens: List[str]) -> Optional[str]:
    """Optimized LLM generation with better error handling"""
    if llm is None:
        logger.warning("LLM not available for generation")
        return None
    
    try:
        logger.info(f"Generating with prompt length: {len(prompt)}")
        
        output = llm(
            prompt, 
            max_tokens=max_tokens, 
            temperature=temperature, 
            stop=stop_tokens, 
            echo=False,
            repeat_penalty=1.1,
            top_k=40,
            top_p=0.95
        )
        
        if output and 'choices' in output and output['choices']:
            result = output['choices'][0]['text'].strip()
            logger.info(f"LLM generated {len(result)} characters")
            return result
        else:
            logger.warning("Empty or invalid LLM output")
            return None
            
    except Exception as e:
        logger.error(f"LLM generation failed: {e}")
        return None

def generate_summary(text: str) -> str:
    """Generate optimized summary with fallback strategies"""
    if not text.strip():
        return ""
    
    logger.info("Generating summary...")
    
    # Try LLM generation first
    if llm is not None:
        processed_text = _preprocess_text(text, 2000)
        prompt = f"""<|user|>
Summarize this text in 50-70 words, focusing on key points and main ideas:

{processed_text}
<|end|>
<|assistant|>"""
        
        summary = _llm_generate(prompt, 120, 0.3, ["<|end|>", "\n\n"])
        if summary and len(summary.split()) >= 10:  
            logger.info(f"Generated AI summary: {summary[:100]}...")
            return summary
        else:
            logger.warning("LLM summary was empty or too short")
    
    # Fallback: Extractive summary using first sentences
    logger.info("Using fallback extractive summary")
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    if not sentences:
        return text[:300].strip()
    
    # Take first 2-3 sentences up to ~300 chars
    summary_parts = []
    char_count = 0
    for sentence in sentences[:3]:
        if char_count + len(sentence) > 280:
            break
        summary_parts.append(sentence)
        char_count += len(sentence)
    
    fallback_summary = '. '.join(summary_parts) + '.' if summary_parts else text[:300].strip()
    logger.info(f"Fallback summary: {fallback_summary[:100]}...")
    return fallback_summary

def generate_title(text: str) -> str:
    """Generate title for memory content"""
    metadata = generate_metadata(text)
    return metadata.get("title", "Content")

def generate_tags(text: str) -> List[str]:
    """Generate tags for memory content"""
    metadata = generate_metadata(text)
    return metadata.get("tags", [])

def _extract_title_fallback(text: str) -> str:
    """Much more aggressive title extraction"""
    if not text or not text.strip():
        return "Content"
    
    # Clean the text
    clean_text = text.strip()
    
    # Try first line approach
    first_line = clean_text.split('\n')[0].strip()
    if first_line and 5 <= len(first_line) <= 100:
        # Remove common prefixes
        prefixes_to_remove = ['subject:', 'title:', 'topic:', 're:', 'fwd:', 'from:', 'to:']
        first_line_lower = first_line.lower()
        for prefix in prefixes_to_remove:
            if first_line_lower.startswith(prefix):
                first_line = first_line[len(prefix):].strip()
                break
        
        if first_line and len(first_line) >= 5:
            return first_line[:80]
    
    # Try first sentence
    sentences = re.split(r'[.!?]+', clean_text)
    if sentences and sentences[0].strip():
        first_sentence = sentences[0].strip()
        if 5 <= len(first_sentence) <= 150:
            return first_sentence[:80]
    
    # Use first several meaningful words
    words = clean_text.split()
    if words:
        # Filter out very short words and common articles for the title
        meaningful_words = []
        common_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
                       'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
                       'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 
                       'did', 'she', 'use', 'way', 'this', 'that', 'with', 'have', 'they', 
                       'been', 'said', 'each', 'which', 'their', 'time', 'will', 'about'}
        
        for word in words[:15]:  # Look at first 15 words
            if len(word) > 2 and word.lower() not in common_words:
                meaningful_words.append(word)
            elif len(word) > 2:  # Include some common words too
                meaningful_words.append(word)
            
            if len(meaningful_words) >= 8:  # Stop when we have enough
                break
        
        if meaningful_words:
            title = ' '.join(meaningful_words[:8])
            if len(title) <= 80:
                return title
            else:
                return title[:77] + "..."
    
    # Last resort: use first words regardless
    if words:
        title_words = words[:6]
        title = ' '.join(title_words)
        return title[:80] + ('...' if len(' '.join(words)) > len(title) else '')
    
    return "Content"

def generate_metadata_simple(text: str) -> Dict[str, any]:
    """Simplified metadata generation with guaranteed title"""
    
    # Always generate a fallback first
    fallback_title = _extract_title_fallback(text)
    fallback_tags = _extract_tags_fallback(text)
    fallback_category = _extract_category_fallback(text)
    
    logger.info(f"Fallback title: '{fallback_title}'")
    
    # Try LLM if available
    if llm is not None:
        try:
            processed_text = _preprocess_text(text, 1200)
            
            # Try title generation first
            title_prompt = f"""<|user|>
Generate a short, descriptive title for this text (maximum 10 words):

{processed_text}

Title:
<|end|>
<|assistant|>"""
            
            title_response = _llm_generate(title_prompt, 50, 0.3, ["<|end|>", "\n"])
            
            ai_title = fallback_title  # Default to fallback
            if title_response and title_response.strip():
                candidate_title = title_response.strip().strip('"').strip("'").strip()
                if candidate_title and len(candidate_title) > 3 and 'untitled' not in candidate_title.lower():
                    ai_title = candidate_title[:80]
                    logger.info(f"AI generated title: '{ai_title}'")
            
            # Try tags generation
            tags_prompt = f"""<|user|>
Generate 3-5 relevant tags for this text (one word each, comma separated):

{processed_text}

Tags:
<|end|>
<|assistant|>"""
            
            tags_response = _llm_generate(tags_prompt, 30, 0.3, ["<|end|>", "\n"])
            
            ai_tags = fallback_tags  # Default to fallback
            if tags_response and tags_response.strip():
                try:
                    tag_list = [tag.strip().lower() for tag in tags_response.strip().split(',')]
                    ai_tags = [tag for tag in tag_list if tag and len(tag) > 2][:5]
                    logger.info(f"AI generated tags: {ai_tags}")
                except:
                    logger.warning("Failed to parse AI tags")
            
            return {
                "title": ai_title,
                "tags": ai_tags,
                "category": fallback_category
            }
            
        except Exception as e:
            logger.warning(f"LLM metadata generation failed: {e}")
    
    # Return fallback
    return {
        "title": fallback_title,
        "tags": fallback_tags,
        "category": fallback_category
    }

def generate_metadata(text: str) -> Dict[str, any]:
    """Generate metadata with improved extraction and fallbacks"""
    default_metadata = {"title": "Content", "tags": [], "category": None}
    
    if not text.strip():
        logger.warning("Empty text provided for metadata generation")
        return default_metadata
    
    logger.info(f"Generating metadata for text: {text[:100]}...")
    
    # Use simplified approach that's more reliable
    return generate_metadata_simple(text)

def _extract_tags_fallback(text: str) -> List[str]:
    """Extract tags using keyword frequency and patterns"""
    # Simple keyword extraction
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    
    # Common words to exclude
    common_words = {
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
        'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
        'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 
        'did', 'she', 'use', 'way', 'many', 'than', 'them', 'well', 'were',
        'this', 'that', 'with', 'have', 'they', 'been', 'said', 'each', 'which',
        'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other'
    }
    
    word_freq = {}
    for word in words:
        if word not in common_words and len(word) > 3:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Look for specific patterns that might indicate important concepts
    text_lower = text.lower()
    
    # URLs
    if re.search(r'https?://', text):
        word_freq['web'] = word_freq.get('web', 0) + 2
    
    # Code patterns
    if re.search(r'\bdef\b|\bclass\b|\bfunction\b|import\b', text):
        word_freq['code'] = word_freq.get('code', 0) + 3
        
    # Programming languages
    prog_langs = ['python', 'javascript', 'java', 'html', 'css', 'sql', 'php', 'ruby', 'go', 'rust']
    for lang in prog_langs:
        if lang in text_lower:
            word_freq[lang] = word_freq.get(lang, 0) + 2
    
    # Return top 5 most frequent words as tags
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    tags = [word for word, freq in top_words if freq > 0 and len(word) > 2]
    
    # Ensure we have at least some tags
    if not tags and word_freq:
        tags = [word for word, _ in list(word_freq.items())[:3]]
    
    # If still no tags, extract some meaningful words
    if not tags:
        meaningful_words = []
        for word in words:
            if word not in common_words and len(word) > 3:
                meaningful_words.append(word)
                if len(meaningful_words) >= 3:
                    break
        tags = meaningful_words
    
    return tags[:5]  # Max 5 tags

def _extract_category_fallback(text: str) -> Optional[str]:
    """Extract category using keyword patterns and heuristics"""
    text_lower = text.lower()
    
    # Define category keywords
    category_keywords = {
        'work': ['work', 'job', 'office', 'meeting', 'project', 'business', 'professional', 'career', 'colleague', 'manager', 'client', 'deadline', 'task', 'assignment'],
        'technology': ['code', 'programming', 'software', 'computer', 'tech', 'api', 'database', 'server', 'app', 'website', 'algorithm', 'development', 'coding', 'python', 'javascript'],
        'learning': ['learn', 'study', 'education', 'course', 'tutorial', 'lesson', 'training', 'knowledge', 'skill', 'university', 'school', 'academic', 'research'],
        'finance': ['money', 'budget', 'investment', 'financial', 'bank', 'loan', 'expense', 'income', 'savings', 'tax', 'stock', 'price', 'cost', 'payment'],
        'health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'fitness', 'exercise', 'diet', 'wellness', 'treatment', 'symptom', 'therapy'],
        'travel': ['travel', 'trip', 'vacation', 'hotel', 'flight', 'airport', 'destination', 'journey', 'tourism', 'visit', 'explore', 'adventure'],
        'personal': ['personal', 'family', 'friend', 'relationship', 'home', 'life', 'daily', 'routine', 'hobby', 'interest', 'diary', 'journal']
    }
    
    # Calculate scores for each category
    category_scores = {}
    text_words = set(re.findall(r'\b\w+\b', text_lower))
    
    for category, keywords in category_keywords.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                score += text_lower.count(keyword)
            if keyword in text_words:
                score += 2  # Bonus for exact word match
        
        if score > 0:
            category_scores[category] = score
    
    # Return the category with the highest score
    if category_scores:
        best_category = max(category_scores.items(), key=lambda x: x[1])
        if best_category[1] >= 2:  # Minimum score threshold
            return best_category[0].title()  # Capitalize first letter
    
    return None

def generate_category_from_content(text: str, existing_categories: List[str]) -> Optional[str]:
    """Generate or suggest category based on content, create new if needed"""
    if not text.strip():
        return None
    
    logger.info(f"Generating category from {len(existing_categories)} existing categories")
    
    # First try to match with existing categories using the existing function
    matched_category = generate_category(text, existing_categories)
    if matched_category:
        logger.info(f"Matched existing category: {matched_category}")
        return matched_category
    
    # If no match found, generate a new category name using AI
    if llm is not None:
        processed_text = _preprocess_text(text, 1000)
        prompt = f"""<|user|>
Based on this text, suggest a single, concise category name (1-2 words) that best describes the main topic or theme:

Text: {processed_text}

Category name:
<|end|>
<|assistant|>"""
        
        response = _llm_generate(prompt, 20, 0.1, ["\n", "<|end|>"])
        if response:
            category_name = response.strip().strip('"\'').title()
            # Validate category name
            if category_name and len(category_name.split()) <= 3 and len(category_name) <= 20:
                logger.info(f"Generated new category: {category_name}")
                return category_name
    
    # Fallback: Use heuristic-based category generation
    fallback_category = _extract_category_fallback(text)
    if not fallback_category:
        # Generate based on most frequent meaningful words
        words = re.findall(r'\b[A-Za-z]{4,}\b', text)
        if words:
            # Get the most frequent non-common word
            word_freq = {}
            common_words = {'this', 'that', 'with', 'have', 'they', 'been', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'make', 'into', 'than', 'only', 'more', 'very', 'what', 'know', 'just', 'first', 'also', 'after', 'back', 'good', 'come', 'most', 'over', 'think', 'where', 'much', 'right', 'through', 'work', 'life', 'even', 'different', 'want', 'because', 'does', 'part', 'every', 'great', 'world', 'still', 'between', 'public', 'such', 'being', 'here', 'should', 'home', 'school', 'never', 'under', 'might', 'while', 'last', 'another', 'seem', 'these', 'children', 'side', 'feet', 'mile', 'night', 'walk', 'white', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without', 'second', 'later', 'miss', 'idea', 'enough', 'face', 'watch', 'indian', 'really', 'almost', 'above', 'girl', 'sometimes', 'mountain', 'young', 'talk', 'soon', 'list', 'song', 'leave', 'family', 'body', 'music', 'color', 'stand', 'questions', 'fish', 'area', 'mark', 'horse', 'birds', 'problem', 'complete', 'room', 'knew', 'since', 'ever', 'piece', 'told', 'usually', 'friends', 'easy', 'heard', 'order', 'door', 'sure', 'become', 'ship', 'across', 'today', 'during', 'short', 'better', 'best', 'however', 'hours', 'black', 'products', 'happened', 'whole', 'measure', 'remember', 'early', 'waves', 'reached', 'listen', 'wind', 'rock', 'space', 'covered', 'fast', 'several', 'hold', 'himself', 'toward', 'five', 'step', 'morning', 'passed', 'vowel', 'true', 'hundred', 'against', 'pattern', 'numeral', 'table', 'north', 'slowly', 'money', 'farm', 'pulled', 'draw', 'voice', 'seen', 'cold', 'cried', 'plan', 'notice', 'south', 'sing', 'ground', 'fall', 'king', 'town', 'unit', 'figure', 'certain', 'field', 'travel', 'wood', 'fire', 'upon'}
            
            for word in words:
                if word.lower() not in common_words:
                    word_freq[word.lower()] = word_freq.get(word.lower(), 0) + 1
            
            if word_freq:
                most_common = max(word_freq.items(), key=lambda x: x[1])
                fallback_category = most_common[0].title()
    
    logger.info(f"Generated fallback category: {fallback_category}")
    return fallback_category

def generate_category(text: str, categories: List[str]) -> Optional[str]:
    """Generate category with improved matching"""
    if not text.strip() or not categories:
        return None
    
    logger.info(f"Generating category from {len(categories)} options")
    
    # Try LLM first
    if llm is not None:
        processed_text = _preprocess_text(text, 1500)
        category_list = '", "'.join(categories)
        prompt = f"""<|user|>
Choose the most relevant category from: ["{category_list}"]

Text: {processed_text}

Return only the category name:
<|end|>
<|assistant|>"""
        
        response = _llm_generate(prompt, 30, 0.1, ["\n", "<|end|>"])
        if response:
            category_name = response.strip().strip('"\'')
            if category_name in categories:
                logger.info(f"LLM selected category: {category_name}")
                return category_name
    
    # Fallback: Keyword matching
    text_lower = text.lower()
    text_words = set(re.findall(r'\b\w+\b', text_lower))
    
    best_match = None
    best_score = 0
    
    for category in categories:
        category_words = set(re.findall(r'\b\w+\b', category.lower()))
        
        # Calculate overlap score
        overlap = len(text_words.intersection(category_words))
        
        # Boost score for exact substring matches
        if category.lower() in text_lower:
            overlap += 10
        
        # Check for partial matches in category name
        for word in category_words:
            if word in text_lower:
                overlap += 1
        
        if overlap > best_score:
            best_score = overlap
            best_match = category
    
    if best_match:
        logger.info(f"Fallback selected category: {best_match} (score: {best_score})")
    
    return best_match if best_score > 0 else None

# Add a function to check if AI features are working
def get_ai_status():
    """Return status of AI components"""
    return {
        "llm_available": llm is not None,
        "embedding_model_available": True,  # SentenceTransformers should always work
        "model_path_exists": MODEL_PATH.exists(),
        "model_path": str(MODEL_PATH)
    }

