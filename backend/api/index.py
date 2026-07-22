import sys
from pathlib import Path

# Get the absolute path of the backend directory (project root)
file_path = Path(__file__).resolve()
backend_dir = file_path.parent.parent  # Go up from api/ to project root

# Ensure both current directory and backend root are in sys.path
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(file_path.parent))

# Now import FastAPI instance
from app.main import app