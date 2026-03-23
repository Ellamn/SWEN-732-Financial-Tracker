from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import BalanceEvent

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/<balance_id>', methods=["GET"])
def get_balance(balance_id: UUID):
    try:
        balance = db.get_balance_event(balance_id)
        return jsonify(balance.__dict__)
    except:
        return jsonify({"error": f"Balance event {balance_id} not found"}), 404


@balance_bp.route('/<balance_id>', methods=["PUT"])
def put_balance(balance_id: UUID):
    """
    :Query parameters: owner, name, amount, date
    """
    try:
        # TODO
        # db.update_balance(balance_id, **request.args)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {balance_id} not found"}), 404


@balance_bp.route('/', methods=["POST"])
def post_balance():
    """
    :Body parameters: owner, name, amount, date
    """
    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_balance_event(BalanceEvent(**body))
    return {}, 204


@balance_bp.route('/<balance_id>', methods=["DELETE"])
def delete_balance(balance_id: UUID):
    try:
        # TODO
        # db.delete_balance(balance_id)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {balance_id} not found"}), 404
