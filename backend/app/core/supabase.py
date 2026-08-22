from supabase import create_client, Client, ClientOptions
from app.core.config import settings

def get_supabase_client() -> Client:
    options = ClientOptions(postgrest_client_timeout=10, storage_client_timeout=10)
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY, options=options)

# Initialize a global instance
supabase_client = get_supabase_client()
