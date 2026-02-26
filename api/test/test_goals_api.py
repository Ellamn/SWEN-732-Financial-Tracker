from test_utils import *


BASE = 'http://127.0.0.1:5000/goals/'


def test_get_goals():
    result = get_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_put_goals():
    result = put_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_post_goals():
    result = post_rest_call(BASE)
    assert result['message'] == 'Hello world!'


def test_delete_goals():
    result = delete_rest_call(BASE)
    assert result['message'] == 'Hello world!'
