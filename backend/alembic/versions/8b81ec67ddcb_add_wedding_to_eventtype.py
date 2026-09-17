"""add wedding to eventtype

Revision ID: 8b81ec67ddcb
Revises: a047a1e6d848
Create Date: 2026-09-17 18:57:48.010377

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b81ec67ddcb'
down_revision: Union[str, Sequence[str], None] = 'a047a1e6d848'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'wedding'")



def downgrade() -> None:
    """Downgrade schema."""
    pass
