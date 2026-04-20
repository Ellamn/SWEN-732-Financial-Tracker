#!/usr/bin/env python3
"""
Load demo rows into PostgreSQL for local UI testing.

Usage (from anywhere):

    python scripts/seed_dev_data.py

    python scripts/seed_dev_data.py --username leon --force

"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path
from uuid import UUID, uuid4

_REPO_ROOT = Path(__file__).resolve().parent.parent

if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from database.src import database as db
from database.src.db_utils import exec_get_one
from database.src.models.balance_event import BalanceEvent
from database.src.models.budget_goal import BudgetGoal
from database.src.models.expense_category import ExpenseCategory
from database.src.models.income_source import IncomeSource
from database.src.models.user import User


def _get_user_by_name(name: str) -> User | None:
    row = exec_get_one(
        "SELECT id, username FROM users WHERE username = %(name)s ORDER BY id LIMIT 1;",
        {"name": name},
    )

    if not row:
        return None

    return User(row[0], row[1])


def _owner_has_any_data(owner_id: UUID) -> bool:
    if db.get_balance_events_by_owner(owner_id):
        return True
    if db.get_budget_goals_by_owner(owner_id):
        return True
    if db.get_expense_categories_by_owner(owner_id):
        return True
    if db.get_income_sources_by_owner(owner_id):
        return True

    return False


def _clear_user_data(owner_id: UUID) -> None:
    for e in db.get_balance_events_by_owner(owner_id):
        db.delete_balance_event(e.event_id)
    for g in db.get_budget_goals_by_owner(owner_id):
        db.delete_budget_goal(g.goal_id)
    for c in db.get_expense_categories_by_owner(owner_id):
        db.delete_expense_category(c.category_id)
    for s in db.get_income_sources_by_owner(owner_id):
        db.delete_income_source(s.source_id)


def _cents(dollars: float) -> int:
    return int(round(dollars * 100))


def seed_for_user(owner_id: UUID) -> None:
    """Insert demo categories, income sources, transactions, and goals."""
    categories = [
        "Groceries",
        "Rent",
        "Transport",
        "Entertainment",
        "Utilities",
    ]

    for name in categories:
        db.insert_expense_category(
            ExpenseCategory(category_id=uuid4(), owner=owner_id, name=name)
        )

    db.insert_income_source(
        IncomeSource(
            source_id=uuid4(),
            owner=owner_id,
            name="Part-time job",
            is_recurring=True,
        )
    )
    db.insert_income_source(
        IncomeSource(
            source_id=uuid4(),
            owner=owner_id,
            name="Scholarship",
            is_recurring=False,
        )
    )

    # Build six months of transactions ending on the current month so the dashboard
    # bar chart and "this month" stat cards are populated regardless of when the
    # script is run. Amounts in cents, negative = expense.
    today = date.today()

    def month_offset(months_back: int, day: int) -> date:
        """Return today's date shifted back N months, clamped to a safe day-of-month."""
        year = today.year
        month = today.month - months_back
        while month <= 0:
            month += 12
            year -= 1
        # day 28 is safe for every month
        return date(year, month, min(day, 28))

    # Per-month template: a paycheck mid-month + recurring bills + variable spending.
    # Use exact category names in the description.
    monthly_template: list[tuple[str, float]] = [
        ("Paycheck", 620.00),
        ("Paycheck", 620.00),
        ("Rent", -650.00),
        ("Groceries", -92.40),
        ("Groceries", -78.15),
        ("Utilities", -54.20),
        ("Transport", -42.00),
        ("Entertainment", -36.00),
    ]
    # Days in the month each line item lands on (paired by index with monthly_template).
    template_days = [1, 15, 1, 8, 22, 27, 11, 18]

    tx: list[tuple[str, int, date]] = []

    for months_back in range(5, -1, -1):  # 5,4,3,2,1,0  -> oldest -> current month
        for (name, dollars), day in zip(monthly_template, template_days):
            tx.append((name, _cents(dollars), month_offset(months_back, day)))

    # A few one-off events for variety across the chart.
    tx.extend([
        ("Scholarship deposit", _cents(1200.00), month_offset(2, 20)),
        ("Entertainment, concert", -_cents(85.00), month_offset(3, 14)),
        ("Transport, flight home", -_cents(220.00), month_offset(4, 5)),
        ("Groceries, Costco run", -_cents(140.50), month_offset(1, 6)),
    ])

    for name, amount, d in tx:
        db.insert_balance_event(
            BalanceEvent(event_id=uuid4(), owner=owner_id, name=name, amount=amount, date=d)
        )

    db.insert_budget_goal(
        BudgetGoal(
            goal_id=uuid4(),
            owner=owner_id,
            name="Emergency fund",
            amount=_cents(500.00),
            achieve_by_date=date(2026, 12, 31),
            started_on=date(2026, 1, 1),
        )
    )

    db.insert_budget_goal(
        BudgetGoal(
            goal_id=uuid4(),
            owner=owner_id,
            name="New laptop",
            amount=_cents(1200.00),
            achieve_by_date=date(2026, 8, 15),
            started_on=date(2026, 2, 1),
        )
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed demo data for FinTrack local development.")

    parser.add_argument(
        "--username",
        default="demo",
        help="Login name to create or seed (default: demo)",
    )

    parser.add_argument(
        "--force",
        action="store_true",
        help="Remove existing data for this user, then insert demo rows.",
    )
    args = parser.parse_args()

    user = _get_user_by_name(args.username)
    created = user is None

    if created:
        user = db.create_user(args.username)

    if _owner_has_any_data(user.user_id):
        if not args.force:
            print(
                "This user already has data. Run with --force to clear and re-seed, or pick another --username.",
                file=sys.stderr,
            )
            return 1

        _clear_user_data(user.user_id)
        print("Cleared existing data for this user.")

    if created:
        print(f"Created user {args.username!r} (id={user.user_id}).")
    else:
        print(f"Seeding demo data for existing user {args.username!r} (id={user.user_id}).")

    seed_for_user(user.user_id)
    print(
        "Done. Log in on the site with this username to browse transactions, budget categories, goals, and income sources."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
