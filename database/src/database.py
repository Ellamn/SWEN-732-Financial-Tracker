from uuid import UUID

from src.models.balance_event import BalanceEvent
from src.db_utils import exec_commit, exec_commit_returning, exec_get_one
from src.models.budget_goal import BudgetGoal
from src.models.expense_category import ExpenseCategory
from src.models.income_source import IncomeSource
from src.models.user import User

# MARK: User
def create_user(name: str) -> User:
    sql = """
        INSERT INTO users (username)
        VALUES (%(name)s)
        RETURNING id, username;
    """

    user_dict = exec_commit_returning(sql, {"name": name})[0]

    return User(user_dict[0], user_dict[1])

def insert_user(user: User):
    sql = """
        INSERT INTO users (id, username)
        VALUES (%(user_id)s, %(name)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, user.__dict__)

def get_user_with_name(name: str) -> User:
    sql = """
    SELECT id, username FROM users WHERE username = %(name)s;
    """

    user_dict = exec_get_one(sql, {"name": name})

    return User(user_dict[0], user_dict[1])

def get_user_with_uuid(id: UUID) -> User:
    sql = """
    SELECT id, username FROM users WHERE id = %(id)s;
    """

    user_dict = exec_get_one(sql, {"id": id})

    return User(user_dict[0], user_dict[1])

# MARK: Balance Events
def insert_balance_event(event: BalanceEvent):
    sql = """
          INSERT INTO balance_events (id, owner, name, amount, date)
          VALUES (%(event_id)s, %(owner)s, %(name)s, %(amount)s, %(date)s)
          ON CONFLICT DO NOTHING;
          """

    exec_commit(sql, event.__dict__)

def get_balance_event(id: UUID) -> BalanceEvent:
    sql = """
    SELECT id, owner, name, amount, date FROM balance_events WHERE id=%(id)s;
    """

    balance_event_dict = exec_get_one(sql, {"id": id})
    return BalanceEvent(balance_event_dict[0], balance_event_dict[1], balance_event_dict[2], balance_event_dict[3], balance_event_dict[4])

# MARK: Budget Goal
def insert_budget_goal(goal: BudgetGoal):
    sql = """
        INSERT INTO budget_goals (id, owner, name, amount, achieve_by_date, started_on)
        VALUES (%(goal_id)s, %(owner)s, %(name)s, %(amount)s, %(achieve_by_date)s, %(started_on)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, goal.__dict__)


def get_budget_goal(id: UUID) -> BudgetGoal:
    sql = """
    SELECT id, owner, name, amount, achieve_by_date, started_on FROM budget_goals WHERE id=%(id)s;
    """

    budget_goal_dict = exec_get_one(sql, {"id": id})
    return BudgetGoal(budget_goal_dict[0], budget_goal_dict[1], budget_goal_dict[2], budget_goal_dict[3], budget_goal_dict[4], budget_goal_dict[5])


# MARK: Expense Categories
def insert_expense_category(category: ExpenseCategory):
    sql = """
        INSERT INTO expense_category (id, owner, name)
        VALUES (%(category_id)s, %(owner)s, %(name)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, category.__dict__)

def get_expense_category(id: UUID):
    sql = """
    SELECT id, owner, name FROM expense_category WHERE id=%(id)s;
    """

    expense_category_dict = exec_get_one(sql, {"id": id})
    return ExpenseCategory(expense_category_dict[0], expense_category_dict[1], expense_category_dict[2])

# MARK: Income Sources
def insert_income_source(income_source: IncomeSource):
    sql = """
        INSERT INTO income_sources (id, owner, name, is_recurring)
        VALUES (%(source_id)s, %(owner)s, %(name)s, %(is_recurring)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, income_source.__dict__)

def get_income_source(id: UUID):
    sql = """
    SELECT id, owner, name, is_recurring FROM income_sources WHERE id=%(id)s;
    """

    income_source_dict = exec_get_one(sql, {"id": id})

    return IncomeSource(income_source_dict[0], income_source_dict[1], income_source_dict[2], income_source_dict[3])