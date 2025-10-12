import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from app.core.config import settings

class OCDSService:
    def __init__(self):
        self.base_url = settings.OCDS_API_URL
        self.timeout = aiohttp.ClientTimeout(total=30)
    
    async def search_tenders(self, keywords: str, filters: Optional[Dict] = None) -> List[Dict]:
        """Search tenders from OCDS API"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                params = {
                    "text": keywords,
                    "size": 50  # Limit results
                }
                
                # Add filters if provided
                if filters:
                    if filters.get("province"):
                        params["province"] = filters["province"]
                    if filters.get("buyer"):
                        params["buyer"] = filters["buyer"]
                    if filters.get("budget_range"):
                        # Implement budget range filtering
                        pass
                
                async with session.get(f"{self.base_url}/releases", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_tender_data(data.get("releases", []))
                    else:
                        return []
        except Exception as e:
            print(f"Error fetching tenders: {e}")
            return []
    
    async def get_tender_details(self, tender_id: str) -> Optional[Dict]:
        """Get detailed information about a specific tender"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(f"{self.base_url}/releases/{tender_id}") as response:
                    if response.status == 200:
                        return await response.json()
                    return None
        except Exception as e:
            print(f"Error fetching tender details: {e}")
            return None
    
    def _process_tender_data(self, releases: List[Dict]) -> List[Dict]:
        """Process raw OCDS data into standardized format"""
        processed_tenders = []
        
        for release in releases:
            tender = release.get("tender", {})
            parties = release.get("parties", [])
            
            # Extract buyer information
            buyer = {}
            for party in parties:
                if party.get("roles", []) and "buyer" in party["roles"]:
                    buyer = {
                        "name": party.get("name", ""),
                        "id": party.get("id", "")
                    }
                    break
            
            processed_tender = {
                "id": release.get("id", ""),
                "ocid": release.get("ocid", ""),
                "title": tender.get("title", ""),
                "description": tender.get("description", ""),
                "status": tender.get("status", ""),
                "value": tender.get("value", {}),
                "procurementMethod": tender.get("procurementMethod", ""),
                "buyer": buyer,
                "tenderPeriod": tender.get("tenderPeriod", {}),
                "documents": tender.get("documents", []),
                "items": tender.get("items", [])
            }
            
            processed_tenders.append(processed_tender)
        
        return processed_tenders
    
    async def extract_document_text(self, tender_data: Dict) -> str:
        """Extract text from tender documents (simplified)"""
        documents = tender_data.get("documents", [])
        text_content = []
        
        # Add basic tender information
        text_content.append(f"Title: {tender_data.get('title', '')}")
        text_content.append(f"Description: {tender_data.get('description', '')}")
        
        # Add items information
        for item in tender_data.get("items", []):
            text_content.append(f"Item: {item.get('description', '')}")
        
        return " ".join(text_content)