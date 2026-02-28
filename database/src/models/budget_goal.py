from uuid import UUID
from datetime import datetime

class BudgetGoal:
    def __init__(self, goal_id: UUID, owner: UUID, name: str, amount: float, achieve_by_date: datetime, started_on: datetime):
        self.goal_id = goal_id
        self.owner = owner
        self.name = name
        self.amount = amount
        self.achieve_by_date = achieve_by_date
        self.started_on = started_on