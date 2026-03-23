import datetime

from flask import json, jsonify

from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/balance/'


def test_get_balance(one_balance):
    result = get_rest_call(f"{BASE}{one_balance}")

    assert result, "Failed to get"
    assert result['name'] == "Pizza", "Incorrect name"


def test_put_balance(one_balance):
    new_balance = {
        "name" : "Wings",
        "amount": "19.95",
    }

    put_rest_call(f"{BASE}{one_balance}", params=new_balance, expected_code=501)
    
    # result, = db_utils.exec_get_one("SELECT name, amount FROM balance_events")

    # assert result[0] == "Wings"
    # assert result[1] == 19.95


def test_post_balance(one_user):
    new_balance = {
        "owner" : str(one_user),
        "name" : "Fries",
        "amount" : 5.00,
        "date" : str(datetime.datetime.now())
    }

    post_rest_call(BASE, new_balance, post_header={"Content-Type":"application/json"}, expected_code=204)

    result = db_utils.exec_get_all("SELECT * FROM balance_events")

    assert len(result) == 1, "Incorrect number of balance events"
    assert result[0][1] == one_user, "Incorrect balance event insertion"


def test_delete_balance(one_balance):
    delete_rest_call(f"{BASE}{one_balance}", expected_code=501)

    # result = db_utils.exec_get_all("SELECT * FROM balance_events")

    # assert len(result) == 0
