from test_utils import *
from database.src import db_utils

BASE = 'http://127.0.0.1:5000/users/'

# POST Tests
def test_post_users():
    # verifies that creating a user returns 201 with the correct name and a generated id
    result = post_rest_call(BASE, json={'name': 'John Doe'}, expected_code=201)
    assert result['name'] == 'John Doe'
    assert 'id' in result, "Did not return user id"


def test_create_user_missing_name():
    # verifies that POST ing a user with an empty body (aka no name) returns 400
    result = post_rest_call(BASE, json={}, expected_code=400)
    assert 'error' in result, "Did not return an error message"


def test_create_user_no_body():
    # verifies that sending a POST with no request body at all returns 400
    result = post_rest_call(BASE, expected_code=400)
    assert 'error' in result, "Did not return an error message"

# GET Tests
def test_get_user_by_name():
    # verifies that a user can be looked up by username and returns the correct id and name
    created = post_rest_call(BASE, json={"name": "John Doe"}, expected_code=201)
    result  = get_rest_call(BASE, params={"name": "John Doe"})
    assert (
        result['name'] == 'John Doe' and
        result['id'] == created['id']
    ), "Failed to get"


def test_get_user_by_id():
    # verifies that a user can be looked up by their UUID and returns the correct name
    created = post_rest_call(BASE, json={"name": "John Doe"}, expected_code=201)
    result  = get_rest_call(BASE, params={"id": created['id']})

    assert result['name'] == 'John Doe', "Failed to get"


def test_get_user_not_found():
    # verifies that looking up a username that does not exist returns 404 with an error message 
    result = get_rest_call(BASE, params={"name": "nonexistent user"}, expected_code=404)

    assert 'error' in result, "Did not return an error message"


def test_get_user_no_params():
    # verifies that a GET request with no query parameters returns 400 with an error message
    result = get_rest_call(BASE, expected_code=400)

    assert 'error' in result, "Did not return an error message"

# PUT Tests / DELETE Tests
def test_put_users(one_user):
    # verifies that updating a users username persists the new name correctly
    new_user = {"name": "Jane Doe"}
    put_rest_call(BASE + str(one_user), params=new_user)

    result = db_utils.exec_get_one("SELECT username FROM users")

    assert result[0] == new_user["name"], "Failed to put"


def test_delete_users(one_user):
    # verifies that deleting a user by id removes them from the database entirely
    result = delete_rest_call(BASE + str(one_user))

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM users")

    assert result == 0, "Failed to delete"