from ninja import NinjaAPI
from api.routers import auth, opportunities, skills, messages, lms, verification, events

# This function will be imported by the main urls.py
def setup_api_routes(api: NinjaAPI):
    """Add all API routers to the main API instance"""
    api.add_router("/auth", auth.router)  # Real authentication system
    api.add_router("/opportunities", opportunities.router)
    api.add_router("/skills", skills.router)
    api.add_router("/messages", messages.router)
    api.add_router("/lms", lms.router)
    api.add_router("/users", verification.router)
    api.add_router("", events.router)  # Events router at root level for /events paths