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
    try:
        # TODO
        # db.update_income(income_id, **request.args)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404


@income_bp.route('/', methods=["POST"])
def post_income():
    """
    :Body parameters: owner, name, is_recurring
    """
    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_income_source(IncomeSource(**body))
    return {}, 204


@income_bp.route('/<income_id>', methods=["DELETE"])
def delete_income(income_id: UUID):
    try:
        # TODO
        # db.delete_income(income_id)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404
