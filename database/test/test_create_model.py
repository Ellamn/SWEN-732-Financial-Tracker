from datetime import datetime
from uuid import uuid7, UUID

from src import database

def test_create_user():
    user = database.create_user("test_user")
    assert user is not None