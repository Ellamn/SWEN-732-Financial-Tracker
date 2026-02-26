from flask import Blueprint, request
from database.src import database as db
from api.src.models import IncomeSource

income_bp = Blueprint("income",__name__,url_prefix="/income")


@income_bp.route('/', methods=["GET"])
def get_income():
    return {
        'message':'Hello world!'
    }


@income_bp.route('/', methods=["PUT"])
def put_income():
    return {
        'message':'Hello world!'
    }


@income_bp.route('/', methods=["POST"])
def post_income():
    return {
        'message':'Hello world!'
    }


@income_bp.route('/', methods=["DELETE"])
def delete_income():
    return {
        'message':'Hello world!'
    }
