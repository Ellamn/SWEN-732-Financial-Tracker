from uuid import UUID, uuid7

from src.database import get_user

def test_add_balance_event(test_user: UUID):
    user = get_user("test_user")
    assert user.user_id == test_user
