from uuid import UUID

class IncomeSource:
    def __init__(self, source_id: UUID, owner: UUID, name: str, is_recurring: bool):
        self.source_id = source_id
        self.owner = owner
        self.name = name
        self.is_recurring = is_recurring