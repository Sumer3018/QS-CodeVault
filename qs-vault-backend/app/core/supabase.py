from supabase import create_client, Client
from app.core.config import settings

url = settings.SUPABASE_URL
key = settings.SUPABASE_KEY

# Print to console on startup (Debug only - remove in production)
print(f"🔌 Connecting to Supabase: {url}...")

supabase_client: Client = create_client(url, key)
