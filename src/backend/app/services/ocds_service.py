import aiohttp
import httpx
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
        # Try primary fetch via aiohttp
        release = await self._fetch_remote_release(tender_id)
        if release:
            return self._normalize_release(release)

        # Secondary fetch via httpx (some environments have aiohttp TLS/DNS issues)
        release = await self._fetch_remote_release_httpx(tender_id)
        if release:
            return self._normalize_release(release)

        fallback = self._load_offline_release(tender_id)
        if fallback:
            print(f"Using offline OCDS cache for {tender_id}")
            return fallback

        # If nothing found yet and input looks like an OCID, try alternate lookup
        if isinstance(tender_id, str) and tender_id.startswith("ocds-"):
            alt = await self._fetch_by_ocid_query(tender_id)
            if alt:
                return self._normalize_release(alt)

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

    async def _fetch_remote_release_httpx(self, tender_id: str) -> Optional[Dict]:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{self.release_url}/{tender_id}",
                    headers={"Accept": "application/json"}
                )
                if resp.status_code == 200:
                    return resp.json()
                else:
                    # Non-200; log minimal breadcrumb and return None to allow other fallbacks
                    print(f"HTTPX fetch non-200 for release {tender_id}: {resp.status_code}")
        except Exception as exc:
            print(f"HTTPX error fetching tender details for {tender_id}: {exc}")
        return None

    async def _fetch_by_ocid_query(self, ocid: str) -> Optional[Dict]:
        """Fallback approach if /release/{id} path fails; some APIs expose list search by ocid."""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                # Try a generic query endpoint; this may not exist in prod, but won't break if 404
                async with session.get(self.base_url, params={"ocid": ocid, "PageSize": 1}) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Return the first matching release if present
                        if isinstance(data, dict):
                            rels = data.get("releases") or []
                            if rels:
                                return rels[0]
        except Exception as exc:
            print(f"Alternate ocid query failed for {ocid}: {exc}")
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
        # First try a dedicated cached release file matching the tender_id/ocid
        cache_file = self.offline_cache_dir / f"{tender_id}.json"
        if cache_file.exists():
            try:
                with cache_file.open("r", encoding="utf-8") as handle:
                    release = json.load(handle)
                return self._normalize_release(release)
            except Exception as exc:
                print(f"Error loading offline tender data for {tender_id} from cache file: {exc}")
                # fall through to sample search

        # If no dedicated file, try sample_releases.json and find by ocid
        sample_file = self.offline_cache_dir / "sample_releases.json"
        if sample_file.exists():
            try:
                with sample_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                releases = data.get("releases", []) if isinstance(data, dict) else []
                for rel in releases:
                    if str(rel.get("ocid")) == str(tender_id):
                        return self._normalize_release(rel)
            except Exception as exc:
                print(f"Error searching sample releases for {tender_id}: {exc}")
                return None

        return None
