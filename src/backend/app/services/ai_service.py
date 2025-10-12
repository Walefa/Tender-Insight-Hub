import requests
from typing import Optional
from app.core.config import settings

class AIService:
    def __init__(self):
        self.summarization_model = settings.SUMMARIZATION_MODEL
        self.api_key = settings.HUGGINGFACE_API_KEY
    
    async def summarize_text(self, text: str, max_length: int = 150) -> str:
        """Summarize text using HuggingFace model"""
        if not self.api_key:
            # Fallback to extractive summarization
            return self._extractive_summarize(text, max_length)
        
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            payload = {
                "inputs": text,
                "parameters": {
                    "max_length": max_length,
                    "min_length": 30,
                    "do_sample": False
                }
            }
            
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{self.summarization_model}",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                return result[0]['summary_text']
            else:
                return self._extractive_summarize(text, max_length)
                
        except Exception:
            return self._extractive_summarize(text, max_length)
    
    def _extractive_summarize(self, text: str, max_length: int) -> str:
        """Fallback extractive summarization"""
        import re
        from collections import Counter
        
        # Simple sentence extraction based on keyword frequency
        sentences = re.split(r'[.!?]+', text)
        words = re.findall(r'\b\w+\b', text.lower())
        word_freq = Counter(words)
        
        # Score sentences
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) > 10:
                score = sum(word_freq.get(word.lower(), 0) for word in sentence.split())
                scored_sentences.append((sentence.strip(), score, i))
        
        # Get top sentences
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        summary_sentences = [s[0] for s in scored_sentences[:3]]
        
        return '. '.join(summary_sentences) + '.'
    
    async def extract_key_info(self, text: str) -> dict:
        """Extract key information from tender document"""
        # This would use more sophisticated NLP in a real implementation
        summary = await self.summarize_text(text, 120)
        
        # Extract key elements (simplified)
        info = {
            "objective": self._extract_phrases(text, ["objective", "purpose", "aim"]),
            "scope": self._extract_phrases(text, ["scope", "description", "requirements"]),
            "deadline": self._extract_deadline(text),
            "eligibility_criteria": self._extract_eligibility(text)
        }
        
        return {**info, "summary": summary}
    
    def _extract_phrases(self, text: str, keywords: list) -> str:
        sentences = text.split('.')
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in keywords):
                return sentence.strip()
        return ""
    
    def _extract_deadline(self, text: str) -> Optional[str]:
        import re
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}[-/]\d{4}',
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',
            r'\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        return None
    
    def _extract_eligibility(self, text: str) -> list:
        criteria = []
        keywords = ["must have", "required", "eligibility", "qualification", "certification"]
        
        sentences = text.split('.')
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in keywords):
                criteria.append(sentence.strip())
        
        return criteria[:5]  # Return top 5 criteria