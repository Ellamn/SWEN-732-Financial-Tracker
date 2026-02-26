from flask import Blueprint
from database.src import database as db
from api.src.models import BalanceEvent

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/')
def hello_world():
    return {
        "message" : "Hello world!"
    }
