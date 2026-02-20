from uuid import UUID

class ExpenseCategory:
    def __init__(self, category_id: UUID, owner: UUID, name: str):
        self.category_id = category_id
        self.owner = owner
        self.name = name