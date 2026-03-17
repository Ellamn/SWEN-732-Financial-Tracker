from flask import Blueprint, request, jsonify
from api.src.models import User
from database.src import database as db

users_bp = Blueprint("users",__name__,url_prefix="/users")


@users_bp.route('/', methods=["GET"])
def get_users():
    name = request.args.get('name')
    user_id = request.args.get('id')

    if name:
        try:
            user = db.get_user_with_name(name)
            return jsonify({"id": str(user.user_id), "name": user.name}), 200
        except Exception:
            return jsonify({"error": "User not found"}), 404
    elif user_id:
        try:
            user = db.get_user_with_uuid(user_id)
            return jsonify({"id": str(user.user_id), "name": user.name}), 200
        except Exception:
            return jsonify({"error": "User not found"}), 404
    else:
        return jsonify({"error": "Provide 'name' or 'id' query parameter"}), 400


@users_bp.route('/', methods=["PUT"])
def put_users():
    return jsonify({"error": "Not implemented"}), 501


@users_bp.route('/', methods=["POST"])
def post_users():
    if not request.json or 'name' not in request.json:
        return jsonify({"error": "Missing 'name' field"}), 400

    user = db.create_user(request.json['name'])
    return {
        "id": user.user_id,
        "name": user.name
    }, 201


@users_bp.route('/', methods=["DELETE"])
def delete_users():
    return jsonify({"error": "Not implemented"}), 501

