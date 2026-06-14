"""
Thin wrapper around google-generativeai for XENO CRM.
All AI calls are synchronous (FastAPI runs them in the thread-pool via BackgroundTasks
or directly in route handlers).
"""
import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

_model = genai.GenerativeModel("gemini-1.5-flash")


def call_gemini_json(system: str, user: str) -> dict:
    """Call Gemini and parse the response as JSON."""
    prompt = f"{system}\n\nUser: {user}\n\nRespond with valid JSON only."
    try:
        response = _model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            ),
        )
        return json.loads(response.text)
    except json.JSONDecodeError:
        # Try stripping markdown code fences if present
        raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(raw)


def call_gemini_text(system: str, user: str) -> str:
    """Call Gemini and return plain text response."""
    prompt = f"{system}\n\nUser: {user}"
    response = _model.generate_content(prompt)
    return response.text.strip()
