from flask import Blueprint

users_bp = Blueprint("users",__name__,url_prefix="/users")


@users_bp.route('/')
def hello_world():
    return 'Howdydo!'
