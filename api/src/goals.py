from uuid import UUID, uuid4

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import BudgetGoal


goals_bp = Blueprint("goals", __name__, url_prefix="/goals")


@goals_bp.route('/owner/<owner_id>', methods=["GET"])
def get_goals_by_owner(owner_id: UUID):
    """
    Returns all budget goals for a given owner.

    Args:
        owner_id (UUID): the owner's user id
    """
    try:
        goals = db.get_budget_goals_by_owner(owner_id)
        return jsonify([{
            "goal_id": str(g.goal_id),
            "owner": str(g.owner),
            "name": g.name,
            "amount": g.amount,
            "achieve_by_date": str(g.achieve_by_date),
            "started_on": str(g.started_on)
        } for g in goals]), 200
    except Exception:
        return jsonify({"error": "Could not fetch budget goals"}), 500


@goals_bp.route('/<goal_id>', methods=["GET"])
def get_goals(goal_id: UUID):
    """
    Returns a budget goal object from its id

    Args:
        goal_id (UUID): the goal id
    """
    try:
        goal = db.get_budget_goal(goal_id)
        return jsonify(goal.__dict__)
    except Exception:
        return jsonify({"error": f"Budget Goal {goal_id} not found"}), 404


@goals_bp.route('/<goal_id>', methods=["PUT"])
def put_goals(goal_id: UUID):
    """
    Updates a budget goal

    Args:
        goal_id (UUID): the goal id

    ## Query parameters:
        name (str): the goal name
        amount (float): the goal amount
        achieve_by_date (str): the goal achieve by date (in ISO)
        started_on (str): the goal start date (in ISO)
    """
    if not request.args:
        return jsonify({"error": "Missing query parameters"}), 400

    try:
        name = request.args.get('name')
        if request.args.get('amount') is not None:
            amount = float(request.args["amount"])
        else:
            amount = None
        achieve_by_date = request.args.get("achieve_by_date")
        started_on = request.args.get("started_on")
        db.update_budget_goal(goal_id, name, amount, achieve_by_date, started_on)
        return jsonify({"message": "Updated"}), 200
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400
    except Exception:
        return jsonify({"error": f"Budget Goal {goal_id} not found"}), 404


@goals_bp.route('/', methods=["POST"])
def post_goals():
    """
    Creates a new budget goal

    ## Body parameters:
        owner (UUID): the budget owner
        name (str): the goal name
        amount (float): the goal amount
        achieve_by_date (str): the goal achieve by date (in ISO)
        started_on (str): the goal start date (in ISO)
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    required = ['owner', 'name', 'amount', 'achieve_by_date', 'started_on']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    body = request.json
    goal_id = uuid4()
    goal = BudgetGoal(
        goal_id=goal_id,
        owner=UUID(body['owner']),
        name=body['name'],
        amount=body['amount'],
        achieve_by_date=body['achieve_by_date'],
        started_on=body['started_on']
    )
    db.insert_budget_goal(goal)
    return jsonify({
        "goal_id": str(goal_id),
        "owner": body['owner'],
        "name": body['name'],
        "amount": body['amount'],
        "achieve_by_date": body['achieve_by_date'],
        "started_on": body['started_on']
    }), 201


@goals_bp.route('/<goal_id>', methods=["DELETE"])
def delete_goals(goal_id: UUID):
    """
    Deletes a budget goal

    Args:
        goal_id (UUID): the goal id
    """
    try:
        db.delete_budget_goal(goal_id)
        return jsonify({"message": "Deleted"}), 200
    except Exception:
        return jsonify({"error": f"Budget goal {goal_id} not found"}), 404