from test_utils import *
from database.src import db_utils


BASE = 'http://127.0.0.1:5000/users/'

# POST Tests
def test_post_users():
    result = post_rest_call(BASE, json={'name' : 'John Doe'}, expected_code=201)
    assert result['name'] == 'John Doe'
    assert 'id' in result

def test_create_user_missing_name():
    result = post_rest_call(BASE, json={}, expected_code=400)
    assert 'error' in result

def test_create_user_no_body():
    result = post_rest_call(BASE, expected_code=400)
    assert 'error' in result

# GET Tests

# def test_get_users():
#     result = get_rest_call(BASE)
#     assert result['message'] == 'Hello world!'
def test_get_user_by_name():
    created = post_rest_call(BASE, json={"name": "John Doe"}, expected_code=201)
    result = get_rest_call(BASE, params={"name": "John Doe"})
    assert result['name'] == 'John Doe'
    assert result['id'] == created['id']


def test_get_user_by_id():
    created = post_rest_call(BASE, json={"name": "John Doe"}, expected_code=201)
    result = get_rest_call(BASE, params={"id": created['id']})
    assert result['name'] == 'John Doe'


def test_get_user_not_found():
    result = get_rest_call(BASE, params={"name": "nonexistent user"}, expected_code=404)
    assert 'error' in result


def test_get_user_no_params():
    result = get_rest_call(BASE, expected_code=400)
    assert 'error' in result

# PUT Tests / DELETE Tests ( NOT IMPLEMENTED YET )

def test_put_balance():
    result = put_rest_call(BASE)
    assert result['message'] == 'Hello world!'

def test_delete_users():
    result = delete_rest_call(BASE)
    assert result['message'] == 'Hello world!'
