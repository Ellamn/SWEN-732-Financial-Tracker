import pytest
from src import db_utils
from uuid import UUID

import psycopg2.extras

psycopg2.extras.register_uuid()

@pytest.fixture(scope="function", autouse=True)
def test_user() -> UUID:
    """
    Create a user in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTo users (username) VALUES ('test_user') RETURNING id;
    """

    user_id = db_utils.exec_commit_returning(sql)[0]
    return user_id