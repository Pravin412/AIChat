
from services.retrieval import retrieve_documents
from services.llm_service import generate_answer


def get_rag_response(question: str) -> str:

    # Retrieve relevant healthcare documents
    documents = retrieve_documents(question, top_k=3)

    if not documents:
        return "I could not find relevant information in the healthcare documents."

    # Combine retrieved text into one context
    context = "\n\n".join(
        document["text"] for document in documents
    )

    # Generate an answer using Ollama
    answer = generate_answer(question, context)

    return answer
