import os
import json
import urllib.request
import uuid

EMBED_URL = "http://127.0.0.1:8081/embed"
QDRANT_URL = "http://127.0.0.1:6352/collections/bbqcarioca-conversation/points"

BRAIN_DIR = "/home/jeffer/.gemini/antigravity/brain"
CONVERSATION_IDS = ["b05a9fd7-8230-4ae2-b82e-d955d8cb065b", "7fdce683-4eb8-4564-b767-363304013975"]

def embed_texts_batch(texts, batch_size=20):
    all_vectors = []
    for i in range(0, len(texts), batch_size):
        sub_texts = texts[i:i+batch_size]
        req = urllib.request.Request(
            EMBED_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps({"texts": sub_texts}).encode()
        )
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode())
        all_vectors.extend(data.get("vectors", []))
    return all_vectors

def chunk_text(text, max_chars=1500):
    lines = text.split("\n")
    chunks = []
    current = []
    current_len = 0
    for line in lines:
        if current_len + len(line) > max_chars and current:
            chunks.append("\n".join(current))
            current = []
            current_len = 0
        current.append(line)
        current_len += len(line) + 1
    if current:
        chunks.append("\n".join(current))
    return chunks

def main():
    print("Starting ingestion of BBQCarioca Antigravity conversation logs into bbqcarioca-conversation...")
    all_points = []

    for cid in CONVERSATION_IDS:
        overview_path = os.path.join(BRAIN_DIR, cid, ".system_generated", "logs", "overview.txt")
        if not os.path.exists(overview_path):
            overview_path = os.path.join(BRAIN_DIR, cid, "overview.txt")
        
        if not os.path.exists(overview_path):
            print(f"Skipping {cid}, no overview.txt found.")
            continue
        
        print(f"Processing conversation {cid}...")
        with open(overview_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        chunks = chunk_text(content, max_chars=1500)
        if not chunks:
            continue
        
        print(f"Embedding {len(chunks)} chunks for conversation {cid}...")
        embeddings = embed_texts_batch(chunks, batch_size=20)
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"conv://{cid}#{i}"))
            all_points.append({
                "id": point_id,
                "vector": emb,
                "payload": {
                    "conversation_id": cid,
                    "chunk_index": i,
                    "source": "antigravity_brain_log",
                    "tag": "bbqcarioca",
                    "text": chunk
                }
            })

    if all_points:
        batch_size = 50
        for i in range(0, len(all_points), batch_size):
            batch = all_points[i:i+batch_size]
            req = urllib.request.Request(
                QDRANT_URL + "?wait=true",
                headers={"Content-Type": "application/json"},
                data=json.dumps({"points": batch}).encode(),
                method="PUT"
            )
            res = urllib.request.urlopen(req)
            print(f"Uploaded batch {i//batch_size + 1} ({len(batch)} points)")

    print(f"Completed ingestion of {len(all_points)} points into bbqcarioca-conversation!")

if __name__ == "__main__":
    main()
