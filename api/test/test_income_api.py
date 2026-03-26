from database.src import db_utils
from test_utils import *


BASE = 'http://127.0.0.1:5000/income/'


def test_get_income(one_income):
    result = get_rest_call(f"{BASE}{one_income}")
    
    assert result['name'] == 'Job', "Failed to get"


def test_put_income(one_income):
    new_income = {
        "name" : "Inheritance",
        "is_recurring" : False
    }

    result = put_rest_call(f"{BASE}{one_income}",json=new_income,expected_code=200)
    assert result['message'] == 'Updated'

    # result = db_utils.exec_get_one("SELECT name, is_recurring FROM income_sources")

    # assert result[0] == new_income['name'], "Incorrect put"
    # assert result[1] == new_income['is_recurring'], "Incorrect put"


def test_post_income(one_user):
    new_income = {
        "owner" : str(one_user),
        "name" : "Charity",
        "is_recurring" : False
    }

    post_rest_call(BASE, new_income, post_header={"Content-Type":"application/json"}, expected_code=204)

    result = db_utils.exec_get_all("SELECT owner FROM income_sources")

    assert len(result) == 1, "Failed to post"
    assert result[0][0] == one_user, "Incorrect post"


def test_delete_income(one_income):
    delete_rest_call(f"{BASE}{one_income}", expected_code=200)

    # result = db_utils.exec_get_all("SELECT * FROM income_sources")

    # assert len(result) == 0, "Failed to delete"
