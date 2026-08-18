# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "httpx",
# ]
# ///

import os
import json
import httpx
import uuid
from pathlib import Path

QDRANT_URL = "http://127.0.0.1:6352"
EMBED_URL = "http://127.0.0.1:8081/embed"
COLLECTION = "bbqcarioca-self"

WORKSPACE = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def chunk_text(text, max_chars=1500):
    """Simple text chunker by paragraphs."""
    paragraphs = text.split('\n\n')
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) > max_chars and current:
            chunks.append(current.strip())
            current = p
        else:
            current += "\n\n" + p
    if current:
        chunks.append(current.strip())
    return chunks

def embed_texts(texts):
    """Get embeddings from the shared mpnet server."""
    print(f"Embedding {len(texts)} chunks...")
    response = httpx.post(EMBED_URL, json={"texts": texts}, timeout=60.0)
    response.raise_for_status()
    return response.json().get("vectors", [])

def ingest_file(file_path):
    print(f"Ingesting {file_path}...")
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Skipping {file_path} (not text): {e}")
        return

    chunks = chunk_text(content)
    if not chunks:
        return

    embeddings = embed_texts(chunks)
    
    points = []
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"file://{file_path}#{i}"))
        points.append({
            "id": point_id,
            "vector": emb,
            "payload": {
                "source": str(file_path.relative_to(WORKSPACE)),
                "content": chunk,
                "chunk_index": i
            }
        })

    # Upload to Qdrant
    res = httpx.put(
        f"{QDRANT_URL}/collections/{COLLECTION}/points",
        json={"points": points},
        timeout=60.0
    )
    res.raise_for_status()
    print(f"Uploaded {len(points)} points from {file_path.name}")

def main():
    print(f"Starting self-ingestion for {COLLECTION}...")
    
    # Target files for ingestion
    targets = [
        WORKSPACE / "SKILL.md",
    ]
    
    # Add files from docs/ if it exists
    docs_dir = WORKSPACE / "docs"
    if docs_dir.exists():
        targets.extend(list(docs_dir.rglob("*.md")))

    count = 0
    for target in targets:
        if target.exists() and target.is_file():
            ingest_file(target)
            count += 1
            
    print(f"Completed ingestion of {count} files.")

if __name__ == "__main__":
    main()
