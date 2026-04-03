import datetime

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
    """
    Creates a test user

    ## Values:
        name: "John Doe"

    Returns:
        user_id (UUID): the user id
    """
    user_id = db_utils.exec_commit_returning("INSERT INTO users(username) VALUES('John Doe') RETURNING id;")[0][0]
    return user_id


@pytest.fixture(scope="function")
def one_balance(one_user):
    """
    Creates a test balance event

    ## Values:
        owner: [`John Doe`'s id]
        name: "Pizza"
        amount: 20.00
        date: now()

    Returns:
        balance_id (UUID): the balance event id
    """
    balance_id = db_utils.exec_commit_returning("INSERT INTO balance_events(owner, name, amount, date) VALUES(%(john)s, 'Pizza', 20.00, %(date)s) RETURNING id", {"john":one_user,"date":datetime.datetime.now()})[0][0]
    return balance_id


@pytest.fixture(scope="function")
def one_expense(one_user):
    """
    Creates a test expense category

    ## Values:
        owner: [`John Doe`'s id]
        name: "Food"

    Returns:
        expense_id (UUID): the expense category id
    """
    expense_id = db_utils.exec_commit_returning("INSERT INTO expense_category(owner, name) VALUES(%(john)s, \'Food\') RETURNING id", {"john":one_user})[0][0]
    return expense_id


@pytest.fixture(scope="function")
def one_income(one_user):
    """
    Creates a test income source

    ## Values:
        owner: [`John Doe`'s id]
        name: "Job"
        is_recurring: True

    Returns:
        income_id (UUID): the income source id
    """
    income_id = db_utils.exec_commit_returning("INSERT INTO income_sources(owner, name, is_recurring) VALUES(%(john)s, \'Job\', TRUE) RETURNING id", {"john":one_user})[0][0]
    return income_id


@pytest.fixture(scope="function")
def one_goal(one_user):
    """
    Creates a test budget goal

    ## Values:
        owner: [`John Doe`'s id]
        name: "New car"
        amount: 25000.00
        achieve_by_date: now() + 52 weeks
        started_on: now()

    Returns:
        goal_id (UUID): the budget goal id
    """
    goal_id = db_utils.exec_commit_returning("INSERT INTO budget_goals(owner, name, amount, achieve_by_date, started_on) VALUES(%(john)s, \'New car\', 25000, %(date1)s, %(date2)s) RETURNING id", {"john":one_user, "date1":datetime.datetime.now() + datetime.timedelta(weeks=52), "date2":datetime.datetime.now()})[0][0]
    return goal_id
