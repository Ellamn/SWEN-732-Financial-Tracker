from test_utils import *
from database.src import db_utils


BASE = 'http://127.0.0.1:5000/users/'


def test_get_users(one_user):
    result = get_rest_call(BASE,params={"name":"John Doe"},get_header={"Content-Type":"application/json"})

    assert result, "Failed to get"
    assert result['name'] == "John Doe", "Incorrect name"


def test_put_users(one_user):
    # TODO
    result = put_rest_call(f"{BASE}Jane%20Doe", params={"name":"John Doe"}, expected_code=501)


def test_post_users():
    result = post_rest_call(BASE,{'name' : 'John Doe'},post_header={'Content-Type' : 'application/json'})

    assert result['name'] == 'John Doe', "Response does not contain inserted user"

    db_result = db_utils.exec_get_one("SELECT 1 FROM users WHERE id = %(id)s", result)

    assert len(db_result) == 1, "User not inserted into database"


def test_delete_users(one_user):
    uuid, = db_utils.exec_get_one("SELECT id FROM users")
    # TODO
    result = delete_rest_call(f"{BASE}{uuid}", expected_code=501)
