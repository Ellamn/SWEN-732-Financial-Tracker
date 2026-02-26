from flask import Blueprint
from database.src import database as db
from api.src.models import BalanceEvent

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/', methods=["GET"])
def get_balance():
    return {
        'message':'Hello world!'
    }


@balance_bp.route('/', methods=["PUT"])
def put_balance():
    return {
        'message':'Hello world!'
    }


@balance_bp.route('/', methods=["POST"])
def post_balance():
    return {
        'message':'Hello world!'
    }


@balance_bp.route('/', methods=["DELETE"])
def delete_balance():
    return {
        'message':'Hello world!'
    }
