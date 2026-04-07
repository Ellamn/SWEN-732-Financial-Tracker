from datetime import datetime
from uuid import uuid7, UUID

from src.models.balance_event import BalanceEvent
from src import database
from src.models.budget_goal import BudgetGoal
from src.models.expense_category import ExpenseCategory
from src.models.income_source import IncomeSource


def test_add_balance_event(test_user: UUID):
    event = BalanceEvent(event_id=uuid7(), owner=test_user, name="test", amount=100, date=datetime.now())
    database.insert_balance_event(event)

def test_add_budget_goal(test_user: UUID):
    goal = BudgetGoal(goal_id=uuid7(), owner=test_user, name="test", amount=100, achieve_by_date=datetime.now(), started_on=datetime.now())
    database.insert_budget_goal(goal)

def test_add_expense_category(test_user: UUID):
    category = ExpenseCategory(category_id=uuid7(), owner=test_user, name="test")
    database.insert_expense_category(category)

def test_add_income_source(test_user: UUID):
    source = IncomeSource(source_id=uuid7(), owner=test_user, name="test", is_recurring=False)
    database.insert_income_source(source)