
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

app = FastAPI(title="Healthcare AI Chatbot")

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:3b"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str

EMERGENCY_KEYWORDS = [
    "chest pain",
    "difficulty breathing",
    "can't breathe",
    "cannot breathe",
    "severe bleeding",
    "unconscious",
    "signs of stroke",
    "suicidal thoughts",
    "want to kill myself",
]

SAFETY_MESSAGE = (
    "Your message may describe an emergency. "
    "Please seek immediate medical help or contact your local "
    "emergency services. If you may harm yourself, or are in "
    "immediate danger, contact emergency services or a crisis "
    "support service now. Do not wait for an AI response."
)


def check_emergency(message: str) -> bool:
    message = message.lower()
    return any(
        keyword in message
        for keyword in EMERGENCY_KEYWORDS
    )

@app.get("/")
def home():
    return {"message": "AIChat backend is running"}


@app.get("/health")
def health():
    """Check the API and local Ollama service."""
    ollama_status = "available"

    try:
        response = httpx.get(
            "http://localhost:11434/api/tags",
            timeout=3.0,
        )
        response.raise_for_status()
    except (httpx.HTTPError, httpx.TimeoutException):
        ollama_status = "unavailable"

    return {
        "api_status": "running",
        "ollama_status": ollama_status,
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty or whitespace.",
        )
    if check_emergency(user_message):
        return ChatResponse(reply=SAFETY_MESSAGE)

    try:
        response = httpx.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a healthcare information assistant. "
                            "Provide general educational information, not a "
                            "medical diagnosis. Do not prescribe medication "
                            "or provide unsupported dosage instructions. "
                            "Encourage professional medical care when "
                            "appropriate. For possible emergencies, advise "
                            "immediate medical attention or local emergency "
                            "services. Be clear about uncertainty."
                        ),
                    },
                    {
                        "role": "user",
                        "content": user_message,
                    },
                ],
                "stream": False,
            },
            timeout=120.0,
        )

        response.raise_for_status()
        data = response.json()
        reply_message = data["message"]["content"]

        if not isinstance(reply_message, str) or not reply_message.strip():
            raise HTTPException(
                status_code=502,
                detail="The AI model returned an empty response.",
            )

        return ChatResponse(reply=reply_message)

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The AI model took too long to respond. Please try again.",
        )

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to the AI model. Check that Ollama is running.",
        )

    except (KeyError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="The AI model returned an unexpected response.",
        )
