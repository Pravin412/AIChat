
import httpx


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:3b"


def generate_answer(question: str, context: str) -> str:

    system_prompt = """
    You are a healthcare information assistant.

    Answer the user's question using the provided healthcare context.

    Rules:
    1. Use the context as your primary source of information.
    2. Do not invent medical information.
    3. If the context does not contain the answer, clearly say so.
    4. Do not diagnose medical conditions.
    5. Do not prescribe medicines or treatments.
    6. Encourage users to consult qualified healthcare professionals
       for personal medical concerns.
    """

    user_prompt = f"""
    Healthcare context:
    {context}

    User question:
    {question}

    Answer based on the healthcare context.
    """

    payload = {
        "model": MODEL_NAME,
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    }

    try:
        response = httpx.post(
            OLLAMA_URL,
            json=payload,
            timeout=120.0
        )

        response.raise_for_status()

        return response.json()["message"]["content"]

    except httpx.TimeoutException:
        raise RuntimeError("Ollama request timed out.")

    except httpx.HTTPError as error:
        raise RuntimeError(f"Ollama connection failed: {error}")
