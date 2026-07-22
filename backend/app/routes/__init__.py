# Routes package initialization
from .auth import router as auth_router
from .contact import router as contact_router
from .projects import router as projects_router
from .skills import router as skills_router
from .services import router as services_router

__all__ = [
    "auth_router",
    "contact_router",
    "projects_router",
    "skills_router",
    "services_router"
]
