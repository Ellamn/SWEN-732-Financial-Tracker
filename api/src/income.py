from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import IncomeSource

income_bp = Blueprint("income",__name__,url_prefix="/income")


@income_bp.route('/<income_id>', methods=["GET"])
def get_income(income_id: UUID):
    try:
        income = db.get_income_source(income_id)
        return jsonify(income.__dict__)
    except:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404


@income_bp.route('/<income_id>', methods=["PUT"])
def put_income(income_id: UUID):
    """
    :Query parameters: owner, name
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    try:
        name = request.json.get('name')
        is_recurring = request.json.get('is_recurring')
        if name is None or is_recurring is None:
            return jsonify({"error": "Missing 'name' or 'is_recurring' field"}), 400
        db.update_income_source(income_id, name=name, is_recurring=is_recurring)
        return jsonify({"message": "Updated"}), 200
    except:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404


@income_bp.route('/', methods=["POST"])
def post_income():
    """
    :Body parameters: owner, name, is_recurring
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400
    required = ['owner', 'name', 'is_recurring']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_income_source(IncomeSource(**body))
    return {}, 204


@income_bp.route('/<income_id>', methods=["DELETE"])
def delete_income(income_id: UUID):
    try:
        # TODO
        db.delete_income_source(income_id)
        return jsonify({"message": "DELETED"}), 200
    except:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404
