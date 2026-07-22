import sys
import os
from pathlib import Path

# Get current directory (/api) and parent directory (backend project root)
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent

# Inject paths into sys.path at top priority
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(current_dir))

try:
    from app.main import app
except ImportError:
    # Fallback if Vercel sets current working directory directly inside backend/
    from main import app