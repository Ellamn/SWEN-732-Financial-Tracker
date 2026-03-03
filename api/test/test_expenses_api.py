from test_utils import *


BASE = 'http://127.0.0.1:5000/expenses/'


def test_get_expenses():
    result = get_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_put_expenses():
    result = put_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_post_expenses():
    result = post_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_delete_expenses():
    result = delete_rest_call(BASE)
    assert result['message'] == 'Hello world!'
