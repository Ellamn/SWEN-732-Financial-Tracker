import datetime

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

@pytest.fixture(scope="function", autouse=False)
def test_balance_event(test_user) -> UUID:
    """
    Create a balance event in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO balance_events (owner, name, amount, date) VALUES (%(test_user)s,'Dinner',20.00,%(date)s) RETURNING id;
    """

    balance_event_id = exec_commit_returning(sql,{"test_user":test_user,"date":datetime.datetime.now()})[0][0]
    return balance_event_id

@pytest.fixture(scope="function", autouse=False)
def test_income_source(test_user) -> UUID:
    """
    Create a income source in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO income_sources (owner, name, is_recurring) VALUES (%(test_user)s,'Job',TRUE) RETURNING id;
    """

    income_source_id = exec_commit_returning(sql,{"test_user":test_user})[0][0]
    return income_source_id

@pytest.fixture(scope="function", autouse=False)
def test_budget_goal(test_user) -> UUID:
    """
    Create a budget goal in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO budget_goals (owner, name, amount, achieve_by_date, started_on) VALUES (%(test_user)s,'New car',20000,%(achieve_by_date)s,%(started_on)s) RETURNING id;
    """

    budget_goal_id = exec_commit_returning(sql, {
        "test_user":test_user,
        "achieve_by_date":datetime.datetime.now()+datetime.timedelta(weeks=52),
        "started_on": datetime.datetime.now()})[0][0]
    return budget_goal_id

@pytest.fixture(scope="function", autouse=False)
def test_expense_category(test_user) -> UUID:
    """
    Create a expense_category in the database so other functions can link to it.
    :return:
    """
    sql = """
    INSERT INTO expense_category (owner, name) VALUES (%(test_user)s,'Taxes') RETURNING id;
    """

    expense_category_id = exec_commit_returning(sql,{"test_user":test_user})[0][0]
    return expense_category_id