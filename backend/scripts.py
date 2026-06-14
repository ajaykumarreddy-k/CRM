"""
Entry-point wrappers for uv project scripts.
These are called by [project.scripts] in pyproject.toml, which means
after `uv sync` you can run:

    uv run crm       → starts CRM API on port 8000
    uv run channel   → starts channel stub on port 8001
    uv run seed      → seeds the database
"""
import uvicorn


def run_crm() -> None:
    """Start the XENO CRM FastAPI app on port 8000."""
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


def run_channel() -> None:
    """Start the channel stub FastAPI app on port 8001."""
    uvicorn.run("channel_service:app", host="0.0.0.0", port=8001, reload=True)


def run_seed() -> None:
    """Seed the database with demo data."""
    from seed import seed
    seed()


def run_tests() -> None:
    """Run the full API test suite against localhost:8000."""
    import test_api  # noqa: F401 — test_api runs on import
