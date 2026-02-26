from datetime import datetime
from uuid import uuid7, UUID

from src import database
from src.models.balance_event import BalanceEvent


def test_create_user():
    user = database.create_user("test_user")
    assert user is not None

def test_get_user(test_user: UUID):
    user = database.get_user("test_user")
    assert user.user_id == test_user

def test_create_balance_event(test_user: UUID):
    event = BalanceEvent(event_id=uuid7(), owner=test_user, name="test", amount=100, date=datetime.now())
    database.insert_balance_event(event)

    retried_event = database.get_balance_event(event.event_id)

    assert event.event_id == retried_event.event_id
    