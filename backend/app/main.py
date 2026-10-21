from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="Healthcare AI Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def home():
    return {"message": "AIChat backend is running"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    try:
        response = httpx.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "qwen2.5:3b",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a healthcare information assistant. "
                            "Provide general educational information, not "
                            "a medical diagnosis. Do not prescribe medication. "
                            "Encourage professional medical care when appropriate. "
                            "For emergencies, advise contacting local emergency services."
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

        return ChatResponse(reply=reply_message)

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The AI model took too long to respond. Please try again."
        )

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to the AI model. Check that Ollama is running."
        )

    except (KeyError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="The AI model returned an unexpected response."
        )

