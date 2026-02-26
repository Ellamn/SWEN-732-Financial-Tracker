from datetime import datetime
from uuid import uuid7, UUID

from src import database
from src.models.balance_event import BalanceEvent
from src.models.budget_goal import BudgetGoal
from src.models.expense_category import ExpenseCategory


def test_create_user():
    user = database.create_user("test_user")
    assert user is not None

def test_get_user(test_user: UUID):
    user = database.get_user("test_user")
    assert user.user_id == test_user

def test_create_balance_event(test_user: UUID):
    event = BalanceEvent(event_id=uuid7(), owner=test_user, name="test", amount=100, date=datetime.now())
    database.insert_balance_event(event)

    retried_event = database.get_balance_event(event.event_id)

    assert event.event_id == retried_event.event_id

def test_create_budget_goal(test_user: UUID):
    goal = BudgetGoal(goal_id=uuid7(), owner=test_user, name="test", amount=100, achieve_by_date=datetime.now(), started_on=datetime.now())
    database.insert_budget_goal(goal)

    retrieved_goal = database.get_budget_goal(goal.goal_id)

    assert goal.goal_id == retrieved_goal.goal_id

def test_create_expense_category(test_user: UUID):
    category = ExpenseCategory(category_id=uuid7(), owner=test_user, name="test")
    database.insert_expense_category(category)

    retrieved_category = database.get_expense_category(category.category_id)

    assert category.category_id == retrieved_category.category_id