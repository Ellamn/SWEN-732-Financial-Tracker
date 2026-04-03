from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import ExpenseCategory

expenses_bp = Blueprint("expenses",__name__,url_prefix="/expenses")


@expenses_bp.route('/<expense_id>', methods=["GET"])
def get_expenses(expense_id: UUID):
    """
    Returns an expense category object from its id

    Args:
        expense_id (UUID): the category id
    """
    try:
        expense = db.get_expense_category(expense_id)
        return jsonify(expense.__dict__)
    except:
        return jsonify({"error": f"Balance event {expense_id} not found"}), 404


@expenses_bp.route('/<expense_id>', methods=["PUT"])
def put_expenses(expense_id: UUID):
    """
    Updates an expense category

    Args:
        expense_id (UUID): the category id

    ## Query parameters:
        name (str): the category name
    """
    if not request.args or 'name' not in request.args:
        return jsonify({"error": "Missing 'name' field"}), 400
    
    try:
        db.update_expense_category(expense_id, request.args['name'])
        return jsonify({"message": "Updated"}), 200
    except:
        return jsonify({"error": f"Expense category {expense_id} not found"}), 404


@expenses_bp.route('/', methods=["POST"])
def post_expenses():
    """
    Creates a new expense category

    ## Body parameters: 
        owner (UUID): the category owner
        name (str): the category name
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    required = ['owner', 'name']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 40
    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_expense_category(ExpenseCategory(**body))
    return {}, 204


@expenses_bp.route('/<expense_id>', methods=["DELETE"])
def delete_expenses(expense_id):
    """
    Deletes an expense category

    Args:
        expense_id (UUID): the category id
    """
    try:
        db.delete_expense_category(expense_id)
        return jsonify({"message": "Deleted"}), 200
    except:
        return jsonify({"error": f"Expense category {expense_id} not found"}), 404
