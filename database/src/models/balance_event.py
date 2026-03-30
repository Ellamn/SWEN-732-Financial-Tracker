from datetime import datetime
from uuid import UUID

class BalanceEvent:
    def __init__(self, event_id: UUID, owner: UUID, name: str, amount: float, date: datetime):
        self.event_id = event_id
        self.owner = owner
        self.name = name
        self.amount = amount
        self.date = date
