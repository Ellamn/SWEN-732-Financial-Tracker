from database.src import db_utils
from test_utils import get_rest_call, post_rest_call, put_rest_call, delete_rest_call
import pytest 


BASE = 'http://127.0.0.1:5000/balance/'
BASE_OWNER = 'http://127.0.0.1:5000/balance/owner/'
BASE_USERS = 'http://127.0.0.1:5000/users/'

# POST Tests
def test_create_balance_event(one_user):
    # verifies that creating a balance event returns 201 with the event name, amount, and a generated event_id
    new_balance = {
        "owner": str(one_user), "name": "Paycheck",
        "amount": 1500.00, "date": "2025-03-01"
    }
    result = post_rest_call(BASE, json=new_balance, expected_code=201)

    assert (
        result['name'] == 'Paycheck' and
        result['amount'] == pytest.approx(1500.00) 
    ), "Incorrect post return"
    assert 'event_id' in result, "Did not return balance event id"


def test_create_balance_missing_fields(one_user):
    # verifies that omitting required fields when creating a balance event returns 400
    result = post_rest_call(BASE, json={
        "owner": str(one_user), "name": "Paycheck"
    }, expected_code=400)

    assert 'error' in result, "Did not return an error message"


def test_create_balance_no_body():
    # verifies that sending a POST with no request body at all returns 400
    result = post_rest_call(BASE, expected_code=400)

    assert 'error' in result, "Did not return an error message"

# GET Tests
def test_get_balance_event(one_user):
    # verifies that a newly created balance event can be retrieved by its event_id with correct name and amount
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
    # verifies that requesting a balance event with a non-existent ID returns 404 with an error message
    fake_id = "00000000-0000-0000-0000-000000000000"
    result = get_rest_call(BASE + fake_id, expected_code=404)

    assert 'error' in result, "Did not return an error message"


def test_get_balances_by_owner(one_user):
    # verifies that the owner list endpoint returns all balance events belonging to a given user
    event1 = {"owner": str(one_user), "name": "Paycheck", "amount": 1500, "date": "2026-03-01"}
    event2 = {"owner": str(one_user), "name": "Groceries", "amount": -80,  "date": "2026-03-05"}
    post_rest_call(BASE, json=event1, expected_code=201)
    post_rest_call(BASE, json=event2, expected_code=201)

    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 2, "Should return 2 balance events"
    names = {r['name'] for r in result}
    assert names == {"Paycheck", "Groceries"}, "Incorrect events returned"
    assert all('event_id' in r for r in result), "Each event should have an event_id"


def test_get_balances_by_owner_empty(one_user):
    # verifies that the owner list endpoint returns an empty list for a user who has no balance events
    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert isinstance(result, list), "Response should be a list"
    assert len(result) == 0, "Should return empty list for user with no events"


def test_get_balances_by_owner_ordered(one_user):
    # verifies that the owner list endpoint returns events sorted by date descending (most recent first)
    event1 = {"owner": str(one_user), "name": "Old Event", "amount": 100, "date": "2025-01-01"}
    event2 = {"owner": str(one_user), "name": "New Event", "amount": 200, "date": "2026-03-01"}
    post_rest_call(BASE, json=event1, expected_code=201)
    post_rest_call(BASE, json=event2, expected_code=201)

    result = get_rest_call(f"{BASE_OWNER}{one_user}")

    assert result[0]['name'] == "New Event", "Most recent event should be first"
    assert result[1]['name'] == "Old Event", "Oldest event should be last"

# PUT Tests / DELETE Tests

def test_put_balance(one_balance):
    # verifies that updating both name and amount of a balance event persists correctly
    new_balance = {
        "name"   : "Soda",
        "amount" : 3.00
    }
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")

    assert result[0] == "Soda" and result[1] == 3, "Failed to update"


def test_put_balance_value_error(one_balance):
    # verifies that passing a non-numeric string as the amount in a PUT request returns 400
    new_balance = {
        "name"   : "Soda",
        "amount" : "three dollars"
    }
    put_rest_call(BASE + str(one_balance), params=new_balance, expected_code=400)


def test_put_balance_optional_name(one_balance):
    # verifies that a PUT with only a new name updates the name while leaving the amount unchanged
    new_balance = {"name": "Chips"}
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Chips" and result[1] == 20, "Failed to update name optionally"


def test_put_balance_optional_amount(one_balance):
    # verifies that a PUT with only a new amount updates the amount while leaving the name unchanged
    new_balance = {"amount": 5}
    put_rest_call(BASE + str(one_balance), params=new_balance)

    result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")
    assert result[0] == "Pizza" and result[1] == 5, "Failed to update amount optionally"


def test_delete_balance(one_balance):
    # verifies that deleting a balance event by id removes it from the database
    delete_rest_call(BASE + str(one_balance))

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM balance_events")

    assert result == 0, "Failed to delete"