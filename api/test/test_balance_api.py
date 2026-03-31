import datetime

from flask import json, jsonify

from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/balance/'
BASE_USERS = 'http://127.0.0.1:5000/users/'

def _create_test_user():
    result = post_rest_call(BASE_USERS, json={"name": "balance_test_user"}, expected_code=201)
    return result['id']

# POST Tests
def test_create_balance_event():
    user_id = _create_test_user()
    result = post_rest_call(BASE, json={
        "owner": user_id, "name": "Paycheck",
        "amount": 1500.00, "date": "2025-03-01"
    }, expected_code=201)
    assert result['name'] == 'Paycheck'
    assert result['amount'] == 1500.00
    assert 'event_id' in result


def test_create_balance_missing_fields():
    user_id = _create_test_user()
    result = post_rest_call(BASE, json={
        "owner": user_id, "name": "Paycheck"
    }, expected_code=400)
    assert 'error' in result


def test_create_balance_no_body():
    result = post_rest_call(BASE, expected_code=400)
    assert 'error' in result

# GET Tests 
def test_get_balance_event():
    user_id = _create_test_user()
    created = post_rest_call(BASE, json={
        "owner": user_id, "name": "Rent",
        "amount": -800.00, "date": "2025-03-01"
    }, expected_code=201)
    result = get_rest_call(BASE + created['event_id'])
    assert result['name'] == 'Rent'
    assert result['amount'] == -800.00


def test_get_balance_not_found():
    fake_id = "00000000-0000-0000-0000-000000000000"
    result = get_rest_call(BASE + fake_id, expected_code=404)
    assert 'error' in result

# PUT Tests / DELETE Tests

def test_put_balance(one_balance):
    new_balance = {
        "name" : "Soda",
        "amount" : 3.00
    }
    put_rest_call(BASE + str(one_balance),params=new_balance)
    
    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Soda" and result[1] == 3, "Failed to update"

    # Amount ValueError
    new_balance["amount"] = "three dollars"
    put_rest_call(BASE + str(one_balance), params=new_balance, expected_code=400)

    new_balance = {
        "name" : "Chips"
    }
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Chips" and result[1] == 3, "Failed to update optionally"

    new_balance = {
        "amount" : 5
    }
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Chips" and result[1] == 5, "Failed to update optionally"


def test_delete_balance(one_balance):
    delete_rest_call(BASE + str(one_balance))

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM balance_events")

    assert result == 0, "Failed to delete"
