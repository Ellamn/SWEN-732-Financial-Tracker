from database.src.models.balance_event import BalanceEvent
from database.src.db_utils import exec_commit, exec_commit_returning
from database.src.models.budget_goal import BudgetGoal
from database.src.models.expense_category import ExpenseCategory
from database.src.models.income_source import IncomeSource
from database.src.models.user import User

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

def insert_balance_event(event: BalanceEvent):
    sql = """
          INSERT INTO balance_events (id, owner, name, amount, date)
          VALUES (%(event_id)s, %(owner)s, %(name)s, %(amount)s, %(date)s)
          ON CONFLICT DO NOTHING;
          """

    exec_commit(sql, event.__dict__)

def insert_budget_goal(goal: BudgetGoal):
    sql = """
        INSERT INTO budget_goals (id, owner, name, amount, achieve_by_date, started_on)
        VALUES (%(goal_id)s, %(owner)s, %(name)s, %(amount)s, %(achieve_by_date)s, %(started_on)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, goal.__dict__)

def insert_expense_category(category: ExpenseCategory):
    sql = """
        INSERT INTO expense_category (id, owner, name)
        VALUES (%(category_id)s, %(owner)s, %(name)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, category.__dict__)

def insert_income_source(income_source: IncomeSource):
    sql = """
        INSERT INTO income_sources (id, owner, name, is_recurring)
        VALUES (%(source_id)s, %(owner)s, %(name)s, %(is_recurring)s)
        ON CONFLICT DO NOTHING;
    """

    exec_commit(sql, income_source.__dict__)