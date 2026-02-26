import pytest
from uuid import UUID

import psycopg2.extras

from src.db_utils import setup_database_schema, exec_commit_returning

psycopg2.extras.register_uuid()

@pytest.fixture(scope="function", autouse=True)
def reset_database():
    setup_database_schema()

@pytest.fixture(scope="function", autouse=False)
def test_user() -> UUID:
    """
    Create a user in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO users (username) VALUES ('test_user') RETURNING id;
    """

    user_id = exec_commit_returning(sql)[0][0]
    return user_id