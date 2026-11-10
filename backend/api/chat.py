from fastapi import APIRouter, HTTPException
from schemas.chat import ChatRequest, ChatResponse
from services.rag_service import get_rag_response
from services.safety import check_emergency, SAFETY_MESSAGE

router = APIRouter()

@router.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty or whitespace.",
        )

    # Check for emergencies before using RAG
    if check_emergency(user_message):
        return ChatResponse(reply=SAFETY_MESSAGE)

    try:
        # Generate an answer using the RAG pipeline
        reply_message = get_rag_response(user_message)

        if not isinstance(reply_message, str) or not reply_message.strip():
            raise HTTPException(
                status_code=502,
                detail="The AI model returned an empty response.",
            )

        return ChatResponse(reply=reply_message)

    except HTTPException:
        raise

    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="Could not generate a response. Check that Ollama is running.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your healthcare question.",
        )