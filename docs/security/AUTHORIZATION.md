# Authorization & RBAC

## Role-Based Access Control (RBAC)
- All roles are defined in the `Role` enum (e.g., `SUPER_ADMIN`, `ADMIN`).
- Route protection is enforced via FastAPI dependencies (`get_current_active_admin`, `get_current_active_super_admin`).
- Attempting to access an endpoint without the required role results in a `403 Forbidden` response.

## Supabase Row Level Security
- RLS policies ensure that authorization is also enforced at the database level.
- The backend relies on service roles only for administrative tasks; frontend queries must supply the user's JWT to leverage RLS policies.
