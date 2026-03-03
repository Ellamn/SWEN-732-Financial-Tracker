from test_utils import *


BASE = 'http://127.0.0.1:5000/balance/'


def test_get_balance():
    result = get_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_put_balance():
    result = put_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_post_balance():
    result = post_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_delete_balance():
    result = delete_rest_call(BASE)
    assert result['message'] == 'Hello world!'
