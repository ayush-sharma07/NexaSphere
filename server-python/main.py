import logging
import os
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime, timezone

from middleware.rate_limit import create_rate_limiter

load_dotenv()

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    genai = None
    logger.warning("google-generativeai is not installed. AI chat will stay in offline mode.")

# 1. Configuration & Persona
# This instruction tells the bot exactly how to behave and what NexaSphere is.
SYSTEM_PROMPT = """
You are Nexa-AI, the official digital assistant for NexaSphere, GL Bajaj's student-driven tech ecosystem. 
Your tone is futuristic, helpful, and professional.

About NexaSphere:
- Goal: To foster innovation, learning, and collaboration among students.
- Structure: Includes sections for Activities (coding, workshops), Events (hackathons, sessions), and a Core Team.
- Call to Action: Encourage users to 'Join as Member' or 'Apply for Core Team' if they seem interested.

If asked about something unrelated to tech or NexaSphere, politely steer the conversation back to the ecosystem or provide general tech guidance.
"""

# 2. Initialize Gemini
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    logger.warning("GEMINI_API_KEY is not configured. AI Chat will not work.")
    model = None
elif not genai:
    logger.warning("Gemini SDK is unavailable. AI Chat will not work.")
    model = None
else:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(
        model_name='gemini-3.1-flash-lite-preview'
    )

app = FastAPI(title="NexaSphere AI Core")

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://nexasphere-glbajaj.vercel.app",
    "https://admin-nexasphere.vercel.app",
    "https://nexa-sphere-sigma.vercel.app",
    "https://admin-dashboard-navy-pi-22.vercel.app",
]


def parse_cors_origins(raw_value: str | None) -> list[str]:
    source = raw_value if raw_value else ",".join(DEFAULT_CORS_ORIGINS)
    origins = [origin.strip() for origin in source.split(",") if origin.strip() and origin.strip() != "*"]
    return origins or DEFAULT_CORS_ORIGINS

# --- Global Custom Validation Exception Interceptor ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors_dict = {}
    for error in exc.errors():
        field_name = error["loc"][-1] if error["loc"] else "unknown"
        errors_dict[field_name] = error["msg"]

    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "status": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "error": "Unprocessable Entity",
        "message": "Input validation failed.",
        "details": errors_dict
    }
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=payload
    )

forms_rate_limiter = create_rate_limiter(
    window_ms=int(os.getenv("FORMS_RATE_LIMIT_WINDOW_MS", "600000")),
    max_requests=int(os.getenv("FORMS_RATE_LIMIT_MAX", "30")),
    message="Too many form submissions. Please slow down and try again later.",
    key_prefix="forms",
)

chat_rate_limiter = create_rate_limiter(
    window_ms=int(os.getenv("CHAT_RATE_LIMIT_WINDOW_MS", "300000")),
    max_requests=int(os.getenv("CHAT_RATE_LIMIT_MAX", "20")),
    message="Too many chat requests. Please wait a moment and try again.",
    key_prefix="chat",
)

@app.get("/")
async def root():
    return {"message": "NexaSphere AI Core API is running. Visit /docs for Swagger API documentation."}

from routers import forms

try:
    from routers import recommend
except ModuleNotFoundError as exc:
    if exc.name != "redis":
        raise
    recommend = None
    logger.warning("Recommendation router is unavailable because redis is not installed.")

app.include_router(forms.router)
if recommend:
    app.include_router(recommend.router)

# 3. CORS Configuration
origins = parse_cors_origins(os.getenv("CORS_ORIGIN"))
allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() in {"1", "true", "yes"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'",
    )
    response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    )
    return response


@app.middleware("http")
async def rate_limit_requests(request: Request, call_next):
    path = request.url.path

    if path.startswith("/api/forms/"):
        response = forms_rate_limiter.check(request)
        if response:
            return response

    if path == "/ai/chat":
        response = chat_rate_limiter.check(request)
        if response:
            return response

    response = await call_next(request)

    if hasattr(request.state, "rate_limit_remaining"):
        response.headers["X-RateLimit-Remaining"] = str(request.state.rate_limit_remaining)

    if hasattr(request.state, "rate_limit_reset"):
        response.headers["X-RateLimit-Reset"] = str(request.state.rate_limit_reset)

    return response

class ChatRequest(BaseModel):
    message: str

# 4. Chat Endpoint
@app.post("/ai/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        if not model:
            return {"reply": "Nexa-AI Core is offline. (GEMINI_API_KEY missing)"}
            
        # We send the user message to the model along with system instructions manually
        full_prompt = f"System Instruction:\n{SYSTEM_PROMPT}\n\nUser Message:\n{request.message}"
        response = model.generate_content(full_prompt)
        
        if not response.text:
            return {"reply": "Nexa-AI is processing, but returned an empty signal. Try rephrasing."}
            
        return {"reply": response.text}

    except Exception as e:
        error_code = getattr(e, "status_code", None)
        logger.warning(
            "Gemini request failed",
            extra={"error_type": type(e).__name__, "status_code": error_code},
        )
        
        # Friendly error handling for Quota limits
        if error_code == 429 or getattr(getattr(e, "response", None), "status_code", None) == 429:
            return {"reply": "Nexa-AI is currently at peak capacity (Quota Limit). Please wait 60 seconds."}
        
        return {"reply": "Nexa-AI Core Offline. Connection recalibrating..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)