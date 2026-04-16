from database.src import db_utils
from test_utils import get_rest_call, post_rest_call, put_rest_call, delete_rest_call


BASE = 'http://127.0.0.1:5000/income/'


def test_get_income(one_income):
    # verifies that an income source can be retrieved by its id and returns the correct name
    result = get_rest_call(f"{BASE}{one_income}")

    assert result['name'] == 'Job', "Failed to get"


def test_put_income(one_income):
    # verifies that updating both name and is_recurring of an income source persists correctly
    new_income = {
        "name"         : "Inheritance",
        "is_recurring" : False
    }

    put_rest_call(f"{BASE}{one_income}", params=new_income)

    result = db_utils.exec_get_one("SELECT name, is_recurring FROM income_sources")

    assert result[0] == new_income['name'] and result[1] == new_income['is_recurring'], "Incorrect put"


def test_put_income_optional_name(one_income):
    # verifies that a PUT with only a new name updates the name while leaving is_recurring unchanged
    new_income = {"name": "Charity"}
    put_rest_call(BASE + str(one_income), params=new_income)

    result = db_utils.exec_get_one("SELECT name, is_recurring FROM income_sources")
    assert result[0] == "Charity" and result[1] == True, "Failed to update name optionally"


def test_put_income_optional_recurring(one_income):
    # verifies that a PUT with only a new is_recurring value updates that field while leaving the name unchanged
    new_income = {"is_recurring": True}
    put_rest_call(BASE + str(one_income), params=new_income)

    result = db_utils.exec_get_one("SELECT name, is_recurring FROM income_sources")
    assert result[0] == "Job" and result[1] == True, "Failed to update is recurring optionally"


def test_post_income(one_user):
    # verifies that creating an income source returns 204 and persists to the correct owner
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
    # verifies that deleting an income source by id removes it from the database entirely
    delete_rest_call(f"{BASE}{one_income}")

    result, = db_utils.exec_get_one("SELECT COUNT(*) FROM income_sources")

    assert result == 0, "Failed to delete"