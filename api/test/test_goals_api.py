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
        "amount" : 20000,
        "achieve_by_date" : datetime.date(2025,5,12),
        "started_on" : datetime.date(2024,1,4)
    }

    put_rest_call(f"{BASE}{one_goal}",params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount, achieve_by_date, started_on FROM budget_goals")

    assert (
        result[0] == new_goal['name'] and 
        result[1] == new_goal['amount'] and 
        result[2] == new_goal['achieve_by_date'] and 
        result[3] == new_goal['started_on']
    ), "Incorrect put"


def test_put_goals_value_error(one_goal):
    # Amount ValueError
    new_goal = {
        "amount" : "three dollars"
    }
    put_rest_call(BASE + str(one_goal), params=new_goal, expected_code=400)


def test_put_goals_optional_name(one_goal):
    # Name only
    new_goal = {
        "name" : "Motorbike"
    }
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")
    assert (
        result[0] == "Motorbike" and 
        result[1] == 25000
    ), "Failed to update name optionally"


def test_put_goals_optional_amount(one_goal):
    # Amount only
    new_goal = {
        "amount" : 30000
    }
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")
    assert (
        result[0] == "New car" and 
        result[1] == 30000
    ), "Failed to update amount optionally"


def test_put_goals_optional_achieveby(one_goal):
    # Achieve by date only
    new_goal = {
        "achieve_by_date" : datetime.date.today() + datetime.timedelta(weeks=1)
    }
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount, achieve_by_date FROM budget_goals")
    assert (
        result[0] == "New car" and 
        result[1] == 25000 and 
        result[2] == new_goal["achieve_by_date"]
    ), "Failed to update achieve by date optionally"


def test_put_goals_optional_startedon(one_goal):
    # Started on only
    new_goal = {
        "started_on" : datetime.date.today() + datetime.timedelta(weeks=-1)
    }
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount, started_on FROM budget_goals")
    assert (
        result[0] == "New car" and 
        result[1] == 25000 and 
        result[2] == new_goal["started_on"]
    ), "Failed to update started on date optionally"


def test_post_goals(one_user):
    achieve_by = datetime.date.today() + datetime.timedelta(weeks=4)
    started_on = datetime.date.today()
    new_goal = {
        "owner" : str(one_user),
        "name" : "Rent",
        "amount" : 1000,
        "achieve_by_date" : str(achieve_by),
        "started_on" : str(started_on)
    }

    post_rest_call(BASE, new_goal, post_header={"Content-Type":"application/json"}, expected_code=204)

    result = db_utils.exec_get_all("SELECT owner, name, amount, achieve_by_date, started_on FROM budget_goals")

    assert len(result) == 1, "Failed to post"
    assert (
        result[0][0] == one_user and 
        result[0][1] == new_goal["name"] and 
        result[0][2] == new_goal["amount"] and 
        result[0][3] == achieve_by and 
        result[0][4] == started_on
    ), "Incorrect post"


def test_delete_goals(one_goal):
    delete_rest_call(f"{BASE}{one_goal}")

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM income_sources")

    assert result == 0, "Failed to delete"
