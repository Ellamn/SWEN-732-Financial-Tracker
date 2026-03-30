from test_utils import *


BASE = 'http://127.0.0.1:5000/income/'


def test_get_income():
    result = get_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_put_income():
    result = put_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_post_income():
    result = post_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_delete_income():
    result = delete_rest_call(BASE)
    assert result['message'] == 'Hello world!'
