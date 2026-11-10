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