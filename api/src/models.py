from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class BalanceEvent(BaseModel):
    event_id: UUID = None
    owner   : UUID
    name    : str
    amount  : float
    date    : datetime


class BudgetGoal(BaseModel):
    goal_id          : UUID = None
    owner            : UUID
    name             : str
    amount           : float
    achieve_by_date  : datetime
    started_on       : datetime


class ExpenseCategory(BaseModel):
    category_id : UUID = None
    owner       : UUID
    name        : str


class IncomeSource(BaseModel):
    source_id   : UUID = None
    owner       : UUID
    name        : str
    is_recurring: bool


class User(BaseModel):
    user_id : UUID = None
    name    : str
