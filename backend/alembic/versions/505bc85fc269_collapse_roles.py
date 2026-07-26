"""collapse_roles

Revision ID: 505bc85fc269
Revises: 909b8e899b2c
Create Date: 2026-07-25 18:30:57.694627

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '505bc85fc269'
down_revision: Union[str, Sequence[str], None] = '909b8e899b2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Update existing ADMIN users to SUPER_ADMIN
    op.execute("UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN'")
    
    # 2. Rename existing role enum
    op.execute("ALTER TYPE role RENAME TO role_old")
    
    # 3. Create new role enum
    op.execute("CREATE TYPE role AS ENUM('SUPER_ADMIN')")
    
    # 4. Alter table to use new enum type
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE role USING role::text::role")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'SUPER_ADMIN'::role")
    
    # 5. Drop old enum type
    op.execute("DROP TYPE role_old")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE role RENAME TO role_old")
    op.execute("CREATE TYPE role AS ENUM('SUPER_ADMIN', 'ADMIN')")
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE role USING role::text::role")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'ADMIN'::role")
    op.execute("DROP TYPE role_old")
