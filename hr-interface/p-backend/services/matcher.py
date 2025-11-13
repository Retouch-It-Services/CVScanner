# services/matcher.py
import os
import threading
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

#  MODEL CONFIG

NOMIC_ID = "nomic-ai/nomic-embed-text-v1"
GEMMA_ID = "mixedbread-ai/mxbai-gemma-2b"   #Gemma embedding tuned
FALLBACK_ID = "sentence-transformers/all-MiniLM-L6-v2"

HF_TOKEN = os.getenv("HF_TOKEN")

_models = {}
_model_locks = {
    "nomic": threading.Lock(),
    "gemma": threading.Lock(),
    "fallback": threading.Lock(),
}

def _load_sentence_transformer(repo_id, token=None, trust_remote_code=False):
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers is not installed")

    kwargs = {}
    if token:
        kwargs["use_auth_token"] = token
    if trust_remote_code:
        kwargs["trust_remote_code"] = True

    return SentenceTransformer(repo_id, **kwargs)

def get_model(name="nomic"):
    global _models

    if name not in _models or _models[name] is None:
        lock = _model_locks.get(name)
        with lock:
            if name in _models and _models[name] is not None:
                return _models[name]

            try:
                if name == "nomic":
                    print("Loading Nomic model:", NOMIC_ID)
                    _models["nomic"] = _load_sentence_transformer(
                        NOMIC_ID,
                        token=HF_TOKEN,
                        trust_remote_code=True
                    )

                elif name == "gemma":
                    print("Loading Gemma model:", GEMMA_ID)
                    _models["gemma"] = _load_sentence_transformer(
                        GEMMA_ID,
                        token=HF_TOKEN,
                        trust_remote_code=True
                    )

                else:
                    print("Loading fallback model:", FALLBACK_ID)
                    _models["fallback"] = _load_sentence_transformer(FALLBACK_ID)

            except Exception as e:
                print(f"[matcher] error loading model {name}: {e}")
                _models[name] = None
                raise

    return _models.get(name)

def embed_with_model(model_obj, texts, convert_to_numpy=True):
    if model_obj is None:
        return None
    try:
        return model_obj.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    except:
        emb = model_obj.encode(texts)
        try:
            import torch
            if hasattr(emb, "cpu"):
                return emb.cpu().numpy()
        except:
            pass
        return np.array(emb)

def embed_texts(texts, prefer=["nomic", "gemma"], combine="average"):
    if isinstance(texts, str):
        texts = [texts]

    loaded = {}
    for name in prefer:
        try:
            loaded[name] = get_model(name)
        except:
            loaded[name] = None

    if not any(loaded.values()):
        try:
            loaded["fallback"] = get_model("fallback")
        except:
            loaded["fallback"] = None

    available = [n for n, m in loaded.items() if m is not None]
    if not available:
        raise RuntimeError("No embedding models available")

    embs = {}
    for n in available:
        try:
            e = embed_with_model(loaded[n], texts)
            embs[n] = np.asarray(e, dtype=np.float32)
        except Exception as e:
            print(f"[matcher] embedding failed for {n}: {e}")
            embs[n] = None

    embs = {k: v for k, v in embs.items() if v is not None}
    if not embs:
        raise RuntimeError("All models failed to produce embeddings")

    arrays = list(embs.values())
    dims = [a.shape[1] for a in arrays]

    if combine == "concat" and len(arrays) > 1:
        return np.concatenate(arrays, axis=1)

    if len(set(dims)) == 1:
        return np.mean(np.stack(arrays, axis=0), axis=0)

    target_dim = min(dims)
    projected = []
    rng = np.random.RandomState(42)

    for a in arrays:
        if a.shape[1] == target_dim:
            projected.append(a)
        else:
            W = rng.normal(size=(a.shape[1], target_dim)).astype(np.float32)
            projected.append(np.dot(a, W))

    return np.mean(np.stack(projected, axis=0), axis=0)

def cosine_sim(a, b):
    if a is None or b is None:
        return np.array([[]])
    return cosine_similarity(a, b)
