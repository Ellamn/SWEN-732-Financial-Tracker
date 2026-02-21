from flask import Blueprint
from database.src import database as db

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/')
def hello_world():
    return {
        "message" : "Hello world!"
    }
