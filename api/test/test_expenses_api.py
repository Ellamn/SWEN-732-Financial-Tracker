from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/expenses/'
BASE_OWNER = 'http://127.0.0.1:5000/expenses/owner/'


def test_get_expenses(one_expense):
    # verifies that an expense category can be retrieved by its id and returns the correct name
    result = get_rest_call(f"{BASE}{one_expense}")

    assert result['name'] == 'Food', "Incorrect expense category name"


def test_put_expenses(one_expense):
    # verifies that updating an expense categorys name persists correctly
    new_expense = {
        "name" : "Drinks"
    }
    put_rest_call(BASE + str(one_expense), params=new_expense)

    result = db_utils.exec_get_one("SELECT name FROM expense_category")
    assert result[0] == "Drinks", "Failed to update"


def test_post_expenses(one_user):
    # verifies that creating an expense category returns 201 with a generated category_id and correct name, and persists
    new_expense = {
        "owner" : str(one_user),
        "name"  : "Grocery"
    }
    result = post_rest_call(BASE, new_expense, post_header={"Content-Type":"application/json"}, expected_code=201)

    assert 'category_id' in result, "Did not return category_id"
    assert result['name'] == "Grocery", "Incorrect name in response"

    rows = db_utils.exec_get_all("SELECT owner, name FROM expense_category")
    assert len(rows) == 1, "Failed to post"
    assert rows[0][0] == one_user, "Incorrect owner"


def test_post_expenses_missing_fields(one_user):
    # verifies that omitting required fields (e.g. name) when creating an expense category returns 400
    result = post_rest_call(BASE, {"owner": str(one_user)}, post_header={"Content-Type": "application/json"}, expected_code=400)
    assert 'error' in result, "Did not return an error message"


def test_post_expenses_no_body():
    # verifies that sending a POST with no request body returns 400
    result = post_rest_call(BASE, expected_code=400)
    assert 'error' in result, "Did not return an error message"


def test_get_expenses_by_owner(one_user):
    # verifies that the owner list endpoint returns all expense categories belonging to a given user
    cat1 = {"owner": str(one_user), "name": "Food"}
    cat2 = {"owner": str(one_user), "name": "Transport"}
    post_rest_call(BASE, cat1, post_header={"Content-Type": "application/json"}, expected_code=201)
    post_rest_call(BASE, cat2, post_header={"Content-Type": "application/json"}, expected_code=201)

    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 2, "Should return 2 categories"
    names = {r['name'] for r in result}
    assert names == {"Food", "Transport"}, "Incorrect categories returned"


def test_get_expenses_by_owner_empty(one_user):
    # verifies that the owner list endpoint returns an empty list for a user who has no expense categories
    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 0, "Should return empty list for user with no categories"


def test_delete_expenses(one_expense):
    # verifies that deleting an expense category by id removes it from the database entirely
    delete_rest_call(f"{BASE}{one_expense}")

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM expense_category")

    assert result == 0, "Failed to delete"