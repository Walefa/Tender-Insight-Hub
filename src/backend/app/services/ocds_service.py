import aiohttp
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings

class OCDSService:
    def __init__(self):
        # Normalize API base URLs so downstream methods can compose paths reliably
        self.base_url = settings.OCDS_API_URL.rstrip("/")
        self.release_url = f"{self.base_url}/release"
        self.timeout = aiohttp.ClientTimeout(total=30)
        self.offline_cache_dir = Path(__file__).resolve().parent / "offline_data"
    
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

                async with session.get(self.base_url, params=params) as response:
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
        release = await self._fetch_remote_release(tender_id)
        if release:
            return self._normalize_release(release)

        fallback = self._load_offline_release(tender_id)
        if fallback:
            print(f"Using offline OCDS cache for {tender_id}")
            return fallback

        return None

    async def _fetch_remote_release(self, tender_id: str) -> Optional[Dict]:
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(f"{self.release_url}/{tender_id}") as response:
                    if response.status == 200:
                        return await response.json()
        except Exception as exc:
            print(f"Error fetching tender details: {exc}")
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

    def _normalize_release(self, release: Dict[str, Any]) -> Dict[str, Any]:
        tender = release.get("tender", {})
        return {
            "ocid": release.get("ocid"),
            "id": release.get("id"),
            "title": tender.get("title", ""),
            "description": tender.get("description", ""),
            "status": tender.get("status", ""),
            "documents": tender.get("documents", []),
            "items": tender.get("items", []),
            "buyer": release.get("buyer") or tender.get("procuringEntity", {}),
            "tender": tender,
        }

    def _load_offline_release(self, tender_id: str) -> Optional[Dict[str, Any]]:
        cache_file = self.offline_cache_dir / f"{tender_id}.json"
        if not cache_file.exists():
            return None

        try:
            with cache_file.open("r", encoding="utf-8") as handle:
                release = json.load(handle)
            return self._normalize_release(release)
        except Exception as exc:
            print(f"Error loading offline tender data for {tender_id}: {exc}")
            return None
