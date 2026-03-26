import datetime

from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/goals/'


def test_get_goals(one_goal):
    result = get_rest_call(f"{BASE}{one_goal}")

    assert result['name'] == 'New car', "Failed to get"


def test_put_goals(one_goal):
    new_goal = {
        "name" : "Mortgage",
        "amount" : 20000
    }

    result = put_rest_call(f"{BASE}{one_goal}", json=new_goal, expected_code=200)
    assert result['message'] == 'Updated'

    # result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")

    # assert result[0] == new_income['name'], "Incorrect put"
    # assert result[1] == new_income['amount'], "Incorrect put"


def test_post_goals(one_user):
    new_goal = {
        "owner" : str(one_user),
        "name" : "Rent",
        "amount" : 1000,
        "achieve_by_date" : str(datetime.datetime.now() + datetime.timedelta(weeks=4)),
        "started_on" : str(datetime.datetime.now())
    }

    post_rest_call(BASE, new_goal, post_header={"Content-Type":"application/json"}, expected_code=204)

    result = db_utils.exec_get_all("SELECT owner FROM budget_goals")

    assert len(result) == 1, "Failed to post"
    assert result[0][0] == one_user, "Incorrect post"


def test_delete_goals(one_goal):
    delete_rest_call(f"{BASE}{one_goal}", expected_code=200)

    # result = db_utils.exec_get_all("SELECT * FROM income_sources")

    # assert len(result) == 0, "Failed to delete"
