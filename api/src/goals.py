from flask import Blueprint
from database.src import database as db

goals_bp = Blueprint("goals",__name__,url_prefix="/goals")


@goals_bp.route('/')
def hello_world():
    return {
        "message" : "Hello world!"
    }
