
import chromadb
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"
DB_PATH = "chroma_data"
COLLECTION_NAME = "healthcare_docs"


def retrieve_documents(question: str, top_k: int = 3) -> list[dict]:
    model = SentenceTransformer(MODEL_NAME)

    client = chromadb.PersistentClient(path=DB_PATH)

    collection = client.get_collection(
        name=COLLECTION_NAME
    )

    question_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k
    )

    retrieved_documents = []

    for i in range(len(results["documents"][0])):
        retrieved_documents.append({
            "text": results["documents"][0][i],
            "source": results["metadatas"][0][i]["source"],
            "page": results["metadatas"][0][i]["page"]
        })

    return retrieved_documents
