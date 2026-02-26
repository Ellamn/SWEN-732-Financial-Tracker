from flask import Blueprint, request
from database.src import database as db
from api.src.models import IncomeSource

income_bp = Blueprint("income",__name__,url_prefix="/income")


@income_bp.route('/')
def hello_world():
    return {
        "message" : "Hello world!"
    }
