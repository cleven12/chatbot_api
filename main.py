from flask import Flask, request, jsonify
import mysql.connector
from pinecone import Pinecone
import requests

app = Flask(__name__)
pc = Pinecone(api_key=PINECONE_KEY)

def get_tenant(api_key):
    # single indexed lookup in MySQL, cache in-process dict if you want (resets per worker anyway)
    ...

def embed(text):
    # Gemini embedding-001, single hosted call — no local model
    r = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent",
        params={"key": GEMINI_KEY},
        json={"content": {"parts": [{"text": text}]}}
    )
    return r.json()["embedding"]["values"]

def retrieve(vector, namespace, k=4):
    index = pc.Index("tourism-kb")
    return index.query(vector=vector, namespace=namespace, top_k=k, include_metadata=True)

def ask_llm(prompt, system):
    try:
        return groq_call(prompt, system)   # fast primary
    except Exception:
        return gemini_call(prompt, system) # fallback

@app.route("/api/v1/chat", methods=["POST"])
def chat():
    tenant = get_tenant(request.headers.get("X-API-Key"))
    if not tenant:
        return jsonify({"error": "invalid key"}), 401
    msg = request.json["message"]
    vec = embed(msg)
    matches = retrieve(vec, tenant["namespace"])
    context = "\n".join(m["metadata"]["text"] for m in matches["matches"])
    answer = ask_llm(msg, tenant["system_prompt"] + "\n\nContext:\n" + context)
    save_history(tenant["id"], request.json["session_id"], msg, answer)
    return jsonify({"answer": answer, "sources": [m["metadata"]["source"] for m in matches["matches"]]})
