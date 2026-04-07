from datetime import datetime
from uuid import UUID, uuid1

# Inherit models from database/src/models to support default values
from database.src.models.balance_event      import BalanceEvent     as db_BalanceEvent
from database.src.models.budget_goal        import BudgetGoal       as db_BudgetGoal
from database.src.models.expense_category   import ExpenseCategory  as db_ExpenseCategory
from database.src.models.income_source      import IncomeSource     as db_IncomeSource
from database.src.models.user               import User             as db_User


class BalanceEvent(db_BalanceEvent):
    event_id: UUID = uuid1()
    owner   : UUID
    name    : str
    amount  : float
    date    : datetime

    def __init__(self, owner: UUID, name: str, amount: float, date: datetime, event_id: UUID | str = uuid1()):
        super().__init__(event_id, owner, name, amount, date)


class BudgetGoal(db_BudgetGoal):
    goal_id          : UUID = uuid1()
    owner            : UUID
    name             : str
    amount           : float
    achieve_by_date  : datetime
    started_on       : datetime

    def __init__(self, owner: UUID, name: str, amount: float, achieve_by_date: datetime, started_on: datetime, goal_id: UUID | str = uuid1()):
        super().__init__(goal_id,owner,name,amount,achieve_by_date,started_on)


class ExpenseCategory(db_ExpenseCategory):
    category_id : UUID = uuid1()
    owner       : UUID
    name        : str

    def __init__(self, owner: UUID, name: str, category_id: UUID | str = uuid1()):
        super().__init__(category_id, owner, name)


class IncomeSource(db_IncomeSource):
    source_id   : UUID = uuid1()
    owner       : UUID
    name        : str
    is_recurring: bool

    def __init__(self, owner: UUID, name: str, is_recurring: bool, source_id: UUID | str = uuid1()):
        super().__init__(source_id, owner, name, is_recurring)


class User(db_User):
    user_id : UUID = uuid1()
    name    : str

    def __init__(self, name: str, user_id: UUID | str = uuid1()):
        super().__init__(user_id, name)
