from flask import Blueprint, request
from api.src.models import User
from database.src import database as db

users_bp = Blueprint("users",__name__,url_prefix="/users")


@users_bp.route('/', methods=["GET"])
def get_users():
    return {
        'message':'Hello world!'
    }



@users_bp.route('/', methods=["PUT"])
def put_users():
    return {
        'message':'Hello world!'
    }



@users_bp.route('/', methods=["POST"])
def post_users():
    user = db.create_user(request.json['name'])
    return {
        "id": user.user_id,
        "name": user.name
    }



@users_bp.route('/', methods=["DELETE"])
def delete_users():
    return {
        'message':'Hello world!'
    }
