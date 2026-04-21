from uuid import UUID

import datetime

from database.src.models.balance_event import BalanceEvent
from database.src.db_utils import exec_commit, exec_commit_returning, exec_get_one, exec_get_all
from database.src.models.budget_goal import BudgetGoal
from database.src.models.expense_category import ExpenseCategory
from database.src.models.income_source import IncomeSource
from database.src.models.user import User

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

def delete_user(id: UUID):
    sql = "DELETE FROM users WHERE id = %(id)s;"
    exec_commit(sql, {"id": id})

def update_user(id: UUID, name: str):
    sql = "UPDATE users SET username = COALESCE(%(name)s,username) WHERE id = %(id)s;"
    exec_commit(sql, {"id": id, "name": name})

# MARK: Balance Events
def insert_balance_event(event: BalanceEvent):
    sql = """
          INSERT INTO balance_events (id, owner, name, amount, date, category_id)
          VALUES (%(event_id)s, %(owner)s, %(name)s, %(amount)s, %(date)s, %(category_id)s)
          ON CONFLICT DO NOTHING;
          """

    exec_commit(sql, event.__dict__)

def get_balance_event(id: UUID) -> BalanceEvent:
    sql = """
    SELECT id, owner, name, amount, date, category_id FROM balance_events WHERE id=%(id)s;
    """

    row = exec_get_one(sql, {"id": id})
    return BalanceEvent(row[0], row[1], row[2], row[3], row[4], row[5])

def get_balance_events_by_owner(owner_id: UUID) -> list[BalanceEvent]:
    sql = """
    SELECT id, owner, name, amount, date, category_id FROM balance_events WHERE owner=%(owner_id)s ORDER BY date DESC;
    """

    rows = exec_get_all(sql, {"owner_id": owner_id})
    return [BalanceEvent(r[0], r[1], r[2], r[3], r[4], r[5]) for r in rows]

def delete_balance_event(id: UUID):
    sql = "DELETE FROM balance_events WHERE id = %(id)s;"
    exec_commit(sql, {"id": id})

def update_balance_event(id: UUID, name: str, amount: float, category_id: UUID | None = None):
    sql = """
        UPDATE balance_events SET 
            name = COALESCE(%(name)s,name), 
            amount = COALESCE(%(amount)s,amount),
            category_id = COALESCE(%(category_id)s, category_id)
        WHERE id = %(id)s;
        """
    exec_commit(sql, {"id": id, "name": name, "amount": amount, "category_id": category_id})

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

def get_budget_goals_by_owner(owner_id: UUID) -> list[BudgetGoal]:
    sql = """
    SELECT id, owner, name, amount, achieve_by_date, started_on FROM budget_goals WHERE owner=%(owner_id)s ORDER BY started_on DESC;
    """

    rows = exec_get_all(sql, {"owner_id": owner_id})
    return [BudgetGoal(r[0], r[1], r[2], r[3], r[4], r[5]) for r in rows]

def delete_budget_goal(id: UUID):
    sql = "DELETE FROM budget_goals WHERE id = %(id)s;"
    exec_commit(sql, {"id": id})

def update_budget_goal(id: UUID, name: str, amount: float, achieve_by_date: datetime.date = None, started_on: datetime.date = None):
    sql = """
        UPDATE budget_goals SET 
            name = COALESCE(%(name)s,name), 
            amount = COALESCE(%(amount)s,amount), 
            achieve_by_date = COALESCE(%(achieve_by_date)s, achieve_by_date), 
            started_on = COALESCE(%(started_on)s, started_on) 
        WHERE id = %(id)s;
        """
    exec_commit(sql, {
        "id": id,
        "name": name,
        "amount": amount,
        "achieve_by_date": achieve_by_date,
        "started_on": started_on
    })

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

def get_expense_categories_by_owner(owner_id: UUID) -> list[ExpenseCategory]:
    sql = """
    SELECT id, owner, name FROM expense_category WHERE owner=%(owner_id)s ORDER BY name;
    """

    rows = exec_get_all(sql, {"owner_id": owner_id})
    return [ExpenseCategory(r[0], r[1], r[2]) for r in rows]

def delete_expense_category(id: UUID):
    sql = "DELETE FROM expense_category WHERE id = %(id)s;"
    exec_commit(sql, {"id": id})

def update_expense_category(id: UUID, name: str):
    sql = "UPDATE expense_category SET name = COALESCE(%(name)s,name) WHERE id = %(id)s;"
    exec_commit(sql, {"id": id, "name": name})

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

def get_income_sources_by_owner(owner_id: UUID) -> list[IncomeSource]:
    sql = """
    SELECT id, owner, name, is_recurring FROM income_sources WHERE owner=%(owner_id)s ORDER BY name;
    """

    rows = exec_get_all(sql, {"owner_id": owner_id})
    return [IncomeSource(r[0], r[1], r[2], r[3]) for r in rows]

def delete_income_source(id: UUID):
    sql = "DELETE FROM income_sources WHERE id = %(id)s;"
    exec_commit(sql, {"id": id})

def update_income_source(id: UUID, name: str, is_recurring: bool):
    sql = """
        UPDATE income_sources SET 
            name = COALESCE(%(name)s,name), 
            is_recurring = COALESCE(%(is_recurring)s,is_recurring) 
        WHERE id = %(id)s;
    """
    exec_commit(sql, {"id": id, "name": name, "is_recurring": is_recurring})