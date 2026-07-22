import sys
import os
from pathlib import Path

# Add project root and current directory to sys.path
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))
sys.path.append(str(current_dir.parent))

from app.main import app