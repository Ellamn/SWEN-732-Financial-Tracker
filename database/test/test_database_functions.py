from datetime import datetime
from uuid import uuid4, UUID

from src import database
from src.models.balance_event import BalanceEvent
from src.models.budget_goal import BudgetGoal
from src.models.expense_category import ExpenseCategory
from src.models.income_source import IncomeSource
from src.models.user import User

from src import db_utils

class TestUsers:
    def test_create_user(self):
        user = database.create_user("test_user")
        assert user is not None

    def test_get_user(self, test_user: UUID):
        user = database.get_user_with_name("test_user")
        assert user.user_id == test_user

    def test_insert_user(self):
        user = User(user_id=uuid4(), name="test_user")
        database.insert_user(user)

        retrieved_user = database.get_user_with_uuid(user.user_id)

        assert user.user_id == retrieved_user.user_id

    def test_delete_user(self, test_user):
        database.delete_user(test_user)

        database.delete_user(test_user)

        count, = db_utils.exec_get_one("SELECT COUNT(*) FROM users")

        assert count == 0, "Failed to delete user"

    def test_update_user(self, test_user):
        new_name = "test_user1"

        database.update_user(test_user, new_name)

        result, = db_utils.exec_get_one("SELECT username FROM users")

        assert result == new_name, "Failed to update user"

class TestBalanceEvents:
    def test_create_balance_event(self, test_user: UUID):
        event = BalanceEvent(event_id=uuid4(), owner=test_user, name="test", amount=100, date=datetime.now())
        database.insert_balance_event(event)

        retried_event = database.get_balance_event(event.event_id)

        assert event.event_id == retried_event.event_id

    def test_delete_balance_event(self, test_balance_event):
        database.delete_balance_event(test_balance_event)

        database.delete_balance_event(test_balance_event)

        count, = db_utils.exec_get_one("SELECT COUNT(*) FROM balance_events")

        assert count == 0, "Failed to delete balance event"

    def test_update_balance_event(self, test_balance_event):
        new_name = "Lunch"
        new_amount = 15

        database.update_balance_event(test_balance_event, new_name, new_amount)

        result = db_utils.exec_get_one("SELECT name, amount FROM balance_events")

        assert (
            result[0] == new_name and 
            result[1] == new_amount
        ), "Failed to update balance event"

    def test_get_balanace_events_by_owner(self, test_user, test_balance_event):
        result = database.get_balance_events_by_owner(test_user)

        assert len(result) > 0, "Did not return any balance events"

        assert result[0].event_id == test_balance_event, "Did not return the correct balance event"

class TestBudgetGoals:
    def test_create_budget_goal(self, test_user: UUID):
        goal = BudgetGoal(goal_id=uuid4(), owner=test_user, name="test", amount=100, achieve_by_date=datetime.now(), started_on=datetime.now())
        database.insert_budget_goal(goal)

        retrieved_goal = database.get_budget_goal(goal.goal_id)

        assert goal.goal_id == retrieved_goal.goal_id

    def test_delete_budget_goal(self, test_budget_goal):
        database.delete_budget_goal(test_budget_goal)

        database.delete_budget_goal(test_budget_goal)

        count, = db_utils.exec_get_one("SELECT COUNT(*) FROM budget_goals")

        assert count == 0, "Failed to delete budget goal"

    def test_update_budget_goal(self, test_budget_goal):
        new_name = "Fancy car"
        new_amount = 50000

        database.update_budget_goal(test_budget_goal, new_name, new_amount)

        result = db_utils.exec_get_one("SELECT name, amount FROM budget_goals")

        assert (
            result[0] == new_name and 
            result[1] == new_amount
        ), "Failed to update budget goal"

    def test_get_balanace_events_by_owner(self, test_user, test_budget_goal):
        result = database.get_budget_goals_by_owner(test_user)

        assert len(result) > 0, "Did not return any budget goals"

        assert result[0].goal_id == test_budget_goal, "Did not return the correct budget goal"

class TestExpenseCategories:
    def test_create_expense_category(self, test_user: UUID):
        category = ExpenseCategory(category_id=uuid4(), owner=test_user, name="test")
        database.insert_expense_category(category)

        retrieved_category = database.get_expense_category(category.category_id)

        assert category.category_id == retrieved_category.category_id

    def test_delete_expense_category(self, test_expense_category):
        database.delete_expense_category(test_expense_category)

        database.delete_expense_category(test_expense_category)

        count, = db_utils.exec_get_one("SELECT COUNT(*) FROM expense_category")

        assert count == 0, "Failed to delete expense category"

    def test_update_expense_category(self, test_expense_category):
        new_name = "Food"

        database.update_expense_category(test_expense_category, new_name)

        result = db_utils.exec_get_one("SELECT name FROM expense_category")

        assert (
            result[0] == new_name 
        ), "Failed to update expense category"

    def test_get_balanace_events_by_owner(self, test_user, test_expense_category):
        result = database.get_expense_categories_by_owner(test_user)

        assert len(result) > 0, "Did not return any expense categories"

        assert result[0].category_id == test_expense_category, "Did not return the correct expense category"

class TestIncomeSources:
    def test_create_income_source(self, test_user: UUID):
        source = IncomeSource(source_id=uuid4(), owner=test_user, name="test", is_recurring=False)
        database.insert_income_source(source)

        retrieved_source = database.get_income_source(source.source_id)

        assert source.source_id == retrieved_source.source_id

    def test_delete_income_source(self, test_income_source):
        database.delete_income_source(test_income_source)

        database.delete_income_source(test_income_source)

        count, = db_utils.exec_get_one("SELECT COUNT(*) FROM income_sources")

        assert count == 0, "Failed to delete income source"

    def test_update_income_source(self, test_income_source):
        new_name = "Babysitting"
        new_is_recurring = False

        database.update_income_source(test_income_source, new_name, new_is_recurring)

        result = db_utils.exec_get_one("SELECT name, is_recurring FROM income_sources")

        assert (
            result[0] == new_name and 
            result[1] == new_is_recurring
        ), "Failed to update income source"

    def test_get_balanace_events_by_owner(self, test_user, test_income_source):
        result = database.get_income_sources_by_owner(test_user)

        assert len(result) > 0, "Did not return any income sources"

        assert result[0].source_id == test_income_source, "Did not return the correct income source"
