from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import ExpenseCategory

expenses_bp = Blueprint("expenses",__name__,url_prefix="/expenses")


@expenses_bp.route('/<expense_id>', methods=["GET"])
def get_expenses(expense_id: UUID):
    try:
        expense = db.get_expense_category(expense_id)
        return jsonify(expense.__dict__)
    except:
        return jsonify({"error": f"Balance event {expense_id} not found"}), 404


@expenses_bp.route('/<expense_id>', methods=["PUT"])
def put_expenses(expense_id: UUID):
    """
    :Query parameters: owner, name
    """
    try:
        # TODO
        # db.update_expense(expense_id, **request.args)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {expense_id} not found"}), 404


@expenses_bp.route('/', methods=["POST"])
def post_expenses():
    """
    :Body parameters: owner, name
    """
    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_expense_category(ExpenseCategory(**body))
    return {}, 204


@expenses_bp.route('/<expense_id>', methods=["DELETE"])
def delete_expenses(expense_id):
    try:
        # TODO
        # db.delete_expense(expense_id)
        return jsonify({"error": "Not implemented"}), 501
    except:
        return jsonify({"error": f"Balance event {expense_id} not found"}), 404
