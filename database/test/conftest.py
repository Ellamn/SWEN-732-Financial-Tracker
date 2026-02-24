import pytest
from src import db_utils
from uuid import UUID

import psycopg2.extras

psycopg2.extras.register_uuid()

@pytest.fixture(scope="function", autouse=True)
def reset_database():
    db_utils.exec_sql_file("schema/reset_database.sql")

    db_utils.exec_sql_file("schema/public/users.sql")
    db_utils.exec_sql_file("schema/public/balance_events.sql")
    db_utils.exec_sql_file("schema/public/budget_goals.sql")
    db_utils.exec_sql_file("schema/public/expense_category.sql")
    db_utils.exec_sql_file("schema/public/income_sources.sql")

@pytest.fixture(scope="function", autouse=False)
def test_user() -> UUID:
    """
    Create a user in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO users (username) VALUES ('test_user') RETURNING id;
    """

    user_id = db_utils.exec_commit_returning(sql)[0][0]
    return user_id