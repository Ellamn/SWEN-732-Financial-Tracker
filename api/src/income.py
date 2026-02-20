from flask import Blueprint

income_bp = Blueprint("income",__name__,url_prefix="/income")


@income_bp.route('/')
def hello_world():
    return 'Howdydo!'
