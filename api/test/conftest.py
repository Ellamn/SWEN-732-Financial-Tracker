import pytest

import psycopg2.extras
from database.src.db_utils import setup_database_schema
from database.src import db_utils

psycopg2.extras.register_uuid()

@pytest.fixture(scope="function", autouse=True)
def reset_database():
    setup_database_schema()

@pytest.fixture(scope="function")
def one_user():
    db_utils.exec_commit("INSERT INTO users(username) VALUES('John Doe');")
