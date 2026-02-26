from flask import Blueprint
from database.src import database as db
from api.src.models import ExpenseCategory

expenses_bp = Blueprint("expenses",__name__,url_prefix="/expenses")


@expenses_bp.route('/')
def hello_world():
    return {
        "message" : "Hello world!"
    }
