from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import IncomeSource

income_bp = Blueprint("income",__name__,url_prefix="/income")


@income_bp.route('/', methods=["GET"])
def get_income():
    """
    :Query params: 
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
