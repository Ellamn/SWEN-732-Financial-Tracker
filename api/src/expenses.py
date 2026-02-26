from flask import Blueprint
from database.src import database as db
from api.src.models import ExpenseCategory

expenses_bp = Blueprint("expenses",__name__,url_prefix="/expenses")


@expenses_bp.route('/', methods=["GET"])
def get_expenses():
    return {
        'message':'Hello world!'
    }



@expenses_bp.route('/', methods=["PUT"])
def put_expenses():
    return {
        'message':'Hello world!'
    }



@expenses_bp.route('/', methods=["POST"])
def post_expenses():
    return {
        'message':'Hello world!'
    }



@expenses_bp.route('/', methods=["DELETE"])
def delete_expenses():
    return {
        'message':'Hello world!'
    }
