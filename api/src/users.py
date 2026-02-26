from flask import Blueprint, request
from api.src.models import User
from database.src import database as db

users_bp = Blueprint("users",__name__,url_prefix="/users")


@users_bp.route('/', methods=["GET", "POST"])
def users():
    if request.method == "POST":
        user = db.create_user(request.json['name'])
        return {
            "id": user.user_id,
            "name": user.name
        }
    else:
        return {
            "message" : "Hello world!"
        }
