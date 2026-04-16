from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import ExpenseCategory


expenses_bp = Blueprint("expenses", __name__, url_prefix="/expenses")


@expenses_bp.route('/owner/<owner_id>', methods=["GET"])
def get_expenses_by_owner(owner_id: UUID):
    """
    Returns all expense categories for a given owner.

    Args:
        owner_id (UUID): the owner's user id
    """
    try:
        categories = db.get_expense_categories_by_owner(owner_id)
        return jsonify([{
            "category_id": str(c.category_id),
            "owner": str(c.owner),
            "name": c.name
        } for c in categories]), 200
    except Exception:
        return jsonify({"error": "Could not fetch expense categories"}), 500


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
    except Exception:
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
    except Exception:
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
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    body = request.json
    owner = UUID(body['owner'])
    # generate the id here so we can return it
    from uuid import uuid4
    category_id = uuid4()
    category = ExpenseCategory(category_id=category_id, owner=owner, name=body['name'])
    db.insert_expense_category(category)
    return jsonify({
        "category_id": str(category_id),
        "owner": str(owner),
        "name": body['name']
    }), 201


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
    except Exception:
        return jsonify({"error": f"Expense category {expense_id} not found"}), 404