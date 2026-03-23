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
    user_id = db_utils.exec_commit_returning("INSERT INTO users(username) VALUES('John Doe') RETURNING id;")[0][0]
    return user_id

@pytest.fixture(scope="function")
def one_balance(one_user):
    balance_id = db_utils.exec_commit_returning("INSERT INTO balance_events(owner, name, amount, date) VALUES(%(john)s, 'Pizza', 20.00, %(date)s) RETURNING id", {"john":one_user,"date":datetime.datetime.now()})[0][0]
    return balance_id

@pytest.fixture(scope="function")
def one_expense(one_user):
    expense_id = db_utils.exec_commit_returning("INSERT INTO expense_category(owner, name) VALUES(%(john)s, \'Food\') RETURNING id", {"john":one_user})[0][0]
    return expense_id

@pytest.fixture(scope="function")
def one_income(one_user):
    expense_id = db_utils.exec_commit_returning("INSERT INTO income_sources(owner, name, is_recurring) VALUES(%(john)s, \'Job\', TRUE) RETURNING id", {"john":one_user})[0][0]
    return expense_id
