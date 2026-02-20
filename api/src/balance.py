from flask import Blueprint

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/')
def hello_world():
    return 'Howdydo!'
