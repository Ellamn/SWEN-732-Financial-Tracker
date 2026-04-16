import datetime

from database.src import db_utils
from test_utils import get_rest_call, post_rest_call, put_rest_call, delete_rest_call

BASE = 'http://127.0.0.1:5000/goals/'
BASE_OWNER = 'http://127.0.0.1:5000/goals/owner/'

def test_get_goals(one_goal):
    # verifies that a budget goal can be retrieved by its id and returns the correct name
    result = get_rest_call(f"{BASE}{one_goal}")

    assert result['name'] == 'New car', "Failed to get"


def test_put_goals(one_goal):
    # verifies that updating all fields of a budget goal (name, amount, dates) persists correctly
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
    # verifies that passing a non-numeric string as the amount in a PUT request returns 400
    new_goal = {"amount": "three dollars"}
    put_rest_call(BASE + str(one_goal), params=new_goal, expected_code=400)


def test_put_goals_optional_name(one_goal):
    # verifies that a PUT with only a new name updates the name while leaving all other fields unchanged
    new_goal = {"name": "Motorbike"}
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")
    assert (
        result[0] == "Motorbike" and 
        result[1] == 25000
    ), "Failed to update name optionally"


def test_put_goals_optional_amount(one_goal):
    # verifies that a PUT with only a new amount updates the amount while leaving the name unchanged 
    new_goal = {"amount": 30000}
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")
    assert (
        result[0] == "New car" and
        result[1] == 30000
    ), "Failed to update amount optionally"


def test_put_goals_optional_achieveby(one_goal):
    # verifies that a PUT with only a new achieve_by_date updates that date while leaving name and amount unchanged
    new_goal = {"achieve_by_date": datetime.date.today() + datetime.timedelta(weeks=1)}
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount, achieve_by_date FROM budget_goals")
    assert (
        result[0] == "New car" and
        result[1] == 25000 and
        result[2] == new_goal["achieve_by_date"]
    ), "Failed to update achieve by date optionally"


def test_put_goals_optional_startedon(one_goal):
    # verifies that a PUT with only a new started_on date updates that date while leaving name and amount unchanged
    new_goal = {"started_on": datetime.date.today() + datetime.timedelta(weeks=-1)}
    put_rest_call(BASE + str(one_goal), params=new_goal)

    result = db_utils.exec_get_one("SELECT name, amount, started_on FROM budget_goals")
    assert (
        result[0] == "New car" and
        result[1] == 25000 and
        result[2] == new_goal["started_on"]
    ), "Failed to update started on date optionally"


def test_post_goals(one_user):
    # verifies that creating a budget goal returns 201 with a generated goal_id and correct fields, and persists to the database.
    achieve_by = datetime.date.today() + datetime.timedelta(weeks=4)
    started_on = datetime.date.today()
    new_goal = {
        "owner" : str(one_user),
        "name" : "Rent",
        "amount" : 1000,
        "achieve_by_date" : str(achieve_by),
        "started_on" : str(started_on)
    }

    result = post_rest_call(BASE, new_goal, post_header={"Content-Type":"application/json"}, expected_code=201)

    assert 'goal_id' in result, "Did not return goal_id"
    assert result['name'] == "Rent", "Incorrect name in response"

    rows = db_utils.exec_get_all("SELECT owner, name, amount, achieve_by_date, started_on FROM budget_goals")
    assert len(rows) == 1, "Failed to post"
    assert (
        rows[0][0] == one_user and
        rows[0][1] == new_goal["name"] and
        rows[0][2] == new_goal["amount"] and
        rows[0][3] == achieve_by and
        rows[0][4] == started_on
    ), "Incorrect post"


def test_post_goals_missing_fields(one_user):
    # verifies that omitting required fields when creating a budget goal returns 400
    result = post_rest_call(BASE, {"owner": str(one_user), "name": "Rent"}, post_header={"Content-Type": "application/json"}, expected_code=400)
    assert 'error' in result, "Did not return an error message"


def test_post_goals_no_body():
    # verifies that sending a POST with no request body returns 400
    result = post_rest_call(BASE, expected_code=400)
    assert 'error' in result, "Did not return an error message"


def test_get_goals_by_owner(one_user):
    # verifies that the owner list endpoint returns all budget goals belonging to a given user, each with a goal_id
    today  = str(datetime.date.today())
    future = str(datetime.date.today() + datetime.timedelta(weeks=8))

    goal1 = {"owner": str(one_user), "name": "Emergency Fund", "amount": 500,  "achieve_by_date": future, "started_on": today}
    goal2 = {"owner": str(one_user), "name": "New Laptop",     "amount": 1200, "achieve_by_date": future, "started_on": today}
    post_rest_call(BASE, goal1, post_header={"Content-Type": "application/json"}, expected_code=201)
    post_rest_call(BASE, goal2, post_header={"Content-Type": "application/json"}, expected_code=201)

    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 2, "Should return 2 goals"
    names = {r['name'] for r in result}
    assert names == {"Emergency Fund", "New Laptop"}, "Incorrect goals returned"
    assert all('goal_id' in r for r in result), "Each goal should have a goal_id"


def test_get_goals_by_owner_empty(one_user):
    # verifies that the owner list endpoint returns an empty list for a user who has no budget goals
    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 0, "Should return empty list for user with no goals"


def test_delete_goals(one_goal):
    # verifies that deleting a budget goal by id removes it from the database entirely
    delete_rest_call(f"{BASE}{one_goal}")

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM budget_goals")

    assert result == 0, "Failed to delete"