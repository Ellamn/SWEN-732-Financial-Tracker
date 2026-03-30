from flask import Blueprint
from database.src import database as db
from api.src.models import BudgetGoal

goals_bp = Blueprint("goals",__name__,url_prefix="/goals")


@goals_bp.route('/', methods=["GET"])
def get_goals():
    return {
        'message':'Hello world!'
    }


@goals_bp.route('/', methods=["PUT"])
def put_goals():
    return {
        'message':'Hello world!'
    }


@goals_bp.route('/', methods=["POST"])
def post_goals():
    return {
        'message':'Hello world!'
    }


@goals_bp.route('/', methods=["DELETE"])
def delete_goals():
    return {
        'message':'Hello world!'
    }
