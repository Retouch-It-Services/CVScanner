# test_matcher.py
from services.matcher import embed_texts
import os

token = os.getenv("HF_TOKEN")
print("HF_TOKEN Loaded:", token[:12] + "********" if token else "NOT FOUND")

texts = [
    "This is a resume about Python, ML and data engineering.",
    "We are hiring a Python engineer with ML experience and knowledge of data pipelines."
]

emb = embed_texts(
    texts,
    prefer=["nomic", "gemma"],
    combine="average"
)

print("✅ Embeddings generated successfully!")
print("Embedding shape:", emb.shape)
