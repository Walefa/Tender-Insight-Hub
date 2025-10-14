import httpx
import sys
import os
import json

# Usage: python download_tender_cache.py <ocid> [output_dir]
# Example: python download_tender_cache.py ocds-9t57fa-136707

API_URL = "https://ocds-api.etenders.gov.za/api/OCDSReleases/release/{}"

def fetch_and_save(ocid, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    url = API_URL.format(ocid)
    print(f"Fetching {url} ...")
    try:
        resp = httpx.get(url)
        if resp.status_code == 200:
            data = resp.json()
            out_path = os.path.join(output_dir, f"{ocid}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            print(f"Saved to {out_path}")
        else:
            print(f"Error: HTTP {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Error fetching tender {ocid}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python download_tender_cache.py <ocid>|<ocid_list.txt> [output_dir]")
        sys.exit(1)
    arg = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "offline_data")
    if arg.endswith('.txt'):
        # Batch mode: read OCIDs from file
        with open(arg, "r", encoding="utf-8") as f:
            ocids = [line.strip() for line in f if line.strip()]
        print(f"Batch downloading {len(ocids)} tenders...")
        for ocid in ocids:
            fetch_and_save(ocid, output_dir)
    else:
        # Single OCID mode
        fetch_and_save(arg, output_dir)

if __name__ == "__main__":
    main()
