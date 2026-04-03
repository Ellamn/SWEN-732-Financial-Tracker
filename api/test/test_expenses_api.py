from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/expenses/'


def test_get_expenses(one_expense):
    result = get_rest_call(f"{BASE}{one_expense}")
    
    assert result['name'] == 'Food', "Incorrect expense category name"


def test_put_expenses(one_expense):
    new_expense = {
        "name" : "Drinks"
    }
    put_rest_call(BASE + str(one_expense),params=new_expense)
    
    result = db_utils.exec_get_one("SELECT name FROM expense_category")
    assert result[0] == "Drinks", "Failed to update"


def test_post_expenses(one_user):
    new_expense = {
        "owner" : str(one_user),
        "name" : "Grocery"
    }
    post_rest_call(BASE, new_expense, post_header={"Content-Type":"application/json"}, expected_code=204)

    result = db_utils.exec_get_all("SELECT owner, name FROM expense_category")

    assert len(result) == 1, "Failed to post"
    assert result[0][0] == one_user, "Incorrect post"


def test_delete_expenses(one_expense):
    delete_rest_call(f"{BASE}{one_expense}")

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM expense_category")

    assert result == 0, "Failed to delete"
