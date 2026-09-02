"""add_user_sessions_for_refresh_and_mfa

Revision ID: 1bf4e04dff85
Revises: 76add0e800eb
Create Date: 2026-09-01 21:54:14.248630

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1bf4e04dff85'
down_revision: Union[str, Sequence[str], None] = '76add0e800eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('token_family', sa.String(length=64), nullable=False),
        sa.Column('refresh_token_hash', sa.String(length=255), nullable=False),
        sa.Column('refresh_token_jti', sa.String(length=64), nullable=False),
        sa.Column('user_agent', sa.String(length=512), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_reason', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_sessions_created_at'), 'user_sessions', ['created_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_expires_at'), 'user_sessions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_is_active'), 'user_sessions', ['is_active'], unique=False)
    op.create_index(op.f('ix_user_sessions_last_used_at'), 'user_sessions', ['last_used_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_refresh_token_hash'), 'user_sessions', ['refresh_token_hash'], unique=False)
    op.create_index(op.f('ix_user_sessions_refresh_token_jti'), 'user_sessions', ['refresh_token_jti'], unique=False)
    op.create_index(op.f('ix_user_sessions_revoked_at'), 'user_sessions', ['revoked_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_token_family'), 'user_sessions', ['token_family'], unique=False)
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_sessions_user_id'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_token_family'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_revoked_at'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_refresh_token_jti'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_refresh_token_hash'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_last_used_at'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_is_active'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_expires_at'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_created_at'), table_name='user_sessions')
    op.drop_table('user_sessions')
