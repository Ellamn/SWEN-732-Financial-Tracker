from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import BudgetGoal

goals_bp = Blueprint("goals",__name__,url_prefix="/goals")


@goals_bp.route('/<goal_id>', methods=["GET"])
def get_goals(goal_id: UUID):
    try:
        goal = db.get_budget_goal(goal_id)
        return jsonify(goal.__dict__)
    except:
        return jsonify({"error": f"Budget Goal {goal_id} not found"}), 404


@goals_bp.route('/<goal_id>', methods=["PUT"])
def put_goals(goal_id):
    """
    :Query parameters: owner, name
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    try:
        name = request.json.get('name')
        amount = request.json.get('amount')
        if not name or not amount:
            return jsonify({"error": "Missing 'name' or 'amount' field"}), 400
        db.update_budget_goal(goal_id, name, amount)
        return jsonify({"message": "Updated"}), 200
    except:
        return jsonify({"error": f"Budget Goal {goal_id} not found"}), 404


@goals_bp.route('/', methods=["POST"])
def post_goals():
    """
    :Body parameters: owner, name, amount, achieve_by_date, started_on
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    required = ['owner', 'name', 'amount', 'achieve_by_date', 'started_on']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400
    
    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_budget_goal(BudgetGoal(**body))
    return {}, 204


@goals_bp.route('/<goal_id>', methods=["DELETE"])
def delete_goals(goal_id):
    try:
        db.delete_budget_goal(goal_id)
        return jsonify({"message": "DELETED"}), 200
    except:
        return jsonify({"error": f"Budget goal {goal_id} not found"}), 404
