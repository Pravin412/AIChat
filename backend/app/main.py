from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title = "Healthcare AI Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def home():
    return {"message": "AIChat backend is running"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_message = request.message

    reply_message = f"You sent: {user_message}"

    return ChatResponse(reply=reply_message)
