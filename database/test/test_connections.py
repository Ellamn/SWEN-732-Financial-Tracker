from src.db_utils import connect_to_db

def test_database_connection():
    connection = connect_to_db()
    assert connection