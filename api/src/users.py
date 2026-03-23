from uuid import UUID

from flask import Blueprint, jsonify, request
from api.src.models import User
from database.src import database as db

users_bp = Blueprint("users",__name__,url_prefix="/users")


@users_bp.route('/', methods=["GET"])
def get_user():
    """
    :Query parameters: [uuid, name]
    """
    try:
        if request.args.get('uuid'):
            return db.get_user_with_uuid(request.args.get('uuid')).__dict__
        elif request.args.get('name'):
            return db.get_user_with_name(request.args.get('name')).__dict__
        else:
            return jsonify({"error": "Bad request"}), 400
    except:
        return jsonify({"error": f"User {request.args.get('uuid') or request.args.get('name')} not found"}), 404


@users_bp.route('/<newname>', methods=["PUT"])
def put_user(newname: str):
    """
    :Query parameters: [uuid, name]
    """
    try:
        if request.args.get('uuid'):
            user = db.get_user_with_uuid(request.args['uuid']).__dict__
        elif request.args.get('name'):
            user = db.get_user_with_name(request.args['name']).__dict__
        else:
            return jsonify({"error": "Bad request"}), 400
        
        # TODO
        # db.update_user(user['name'], newname)
        return jsonify({"error": "Not implemented"}), 501

    except:
        return jsonify({"error": f"User {request.args.get('uuid') or request.args.get('name')} not found"}), 404


@users_bp.route('/', methods=["POST"])
def post_users():
    """
    :Body parameters: name
    """
    user = db.create_user(request.json['name'])
    return {
        "id": user.user_id,
        "name": user.name
    }


@users_bp.route('/<uuid>', methods=["DELETE"])
def delete_users(uuid: UUID):
    try:
        user = db.get_user_with_uuid(uuid).__dict__
        
        # TODO
        # db.delete_user(user['uuid'])
        return jsonify({"error": "Not implemented"}), 501

    except:
        return jsonify({"error": f"User {uuid} not found"}), 404

