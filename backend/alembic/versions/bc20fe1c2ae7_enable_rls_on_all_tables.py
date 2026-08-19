"""enable_rls_on_all_tables

Revision ID: bc20fe1c2ae7
Revises: c68adde290f4
Create Date: 2026-08-19 06:34:25.490785

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc20fe1c2ae7'
down_revision: Union[str, Sequence[str], None] = 'c68adde290f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    tables = [
        "alembic_version",
        "announcements",
        "contact_messages",
        "users",
        "gallery",
        "registrations",
        "team_members",
        "events",
        "podcasts",
        "partners",
        "startups"
    ]
    for table in tables:
        op.execute(f"ALTER TABLE IF EXISTS {table} ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    """Downgrade schema."""
    tables = [
        "alembic_version",
        "announcements",
        "contact_messages",
        "users",
        "gallery",
        "registrations",
        "team_members",
        "events",
        "podcasts",
        "partners",
        "startups"
    ]
    for table in tables:
        op.execute(f"ALTER TABLE IF EXISTS {table} DISABLE ROW LEVEL SECURITY;")
