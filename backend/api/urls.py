from ninja import NinjaAPI
from api.routers import auth, opportunities

# This function will be imported by the main urls.py
def setup_api_routes(api: NinjaAPI):
    """Add all API routers to the main API instance"""
    api.add_router("/auth", auth.router)
    api.add_router("/opportunities", opportunities.router)