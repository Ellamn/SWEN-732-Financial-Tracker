from uuid import UUID

class User:
    def __init__(self, user_id: UUID, name: str):
        self.user_id = user_id
        self.name = name