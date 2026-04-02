from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/balance/'
BASE_USERS = 'http://127.0.0.1:5000/users/'

# POST Tests
def test_create_balance_event(one_user):
    new_balance = {
        "owner": str(one_user), "name": "Paycheck",
        "amount": 1500.00, "date": "2025-03-01"
    }
    result = post_rest_call(BASE, json=new_balance, expected_code=201)

    assert (
        result['name'] == 'Paycheck' and 
        result['amount'] == 1500.00
    ), "Incorrect post return"
    assert 'event_id' in result, "Did not return balance event id"


def test_create_balance_missing_fields(one_user):
    result = post_rest_call(BASE, json={
        "owner": str(one_user), "name": "Paycheck"
    }, expected_code=400)

    assert 'error' in result, "Did not return an error message"


def test_create_balance_no_body():
    result = post_rest_call(BASE, expected_code=400)

    assert 'error' in result, "Did not return an error message"

# GET Tests 
def test_get_balance_event(one_user):
    new_event = {
        "owner": str(one_user), "name": "Rent",
        "amount": -800.00, "date": "2025-03-01"
    }
    created = post_rest_call(BASE, json=new_event, expected_code=201)

    result = get_rest_call(BASE + created['event_id'])

    assert (
        result['name'] == 'Rent' and
        result['amount'] == -800.00
    ), "Failed to get"


def test_get_balance_not_found():
    fake_id = "00000000-0000-0000-0000-000000000000"
    result = get_rest_call(BASE + fake_id, expected_code=404)

    assert 'error' in result, "Did not return an error message"

# PUT Tests / DELETE Tests

def test_put_balance(one_balance):
    new_balance = {
        "name" : "Soda",
        "amount" : 3.00
    }
    put_rest_call(BASE + str(one_balance),params=new_balance)
    
    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")

    assert result[0] == "Soda" and result[1] == 3, "Failed to update"


def test_put_balance_value_error(one_balance):
    new_balance = {
        "name" : "Soda",
        "amount" : "three dollars"
    }
    # amount ValueError
    put_rest_call(BASE + str(one_balance), params=new_balance, expected_code=400)


def test_put_balance_optional_name(one_balance):
    # Name only
    new_balance = {
        "name" : "Chips"
    }
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Chips" and result[1] == 20, "Failed to update name optionally"


def test_put_balance_optional_amount(one_balance):
    # Amount only
    new_balance = {
        "amount" : 5
    }
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Pizza" and result[1] == 5, "Failed to update amount optionally"


def test_delete_balance(one_balance):
    delete_rest_call(BASE + str(one_balance))

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM balance_events")

    assert result == 0, "Failed to delete"
