from test_utils import *


BASE = 'http://127.0.0.1:5000/expenses/'


def test_hello():
    message = get_rest_call(BASE)
    assert message['message'] == "Hello world!"