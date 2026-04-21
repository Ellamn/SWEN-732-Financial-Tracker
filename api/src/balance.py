from flask import Blueprint, request, jsonify
from uuid import UUID, uuid4
from datetime import datetime
from database.src import database as db
from api.src.models import BalanceEvent


balance_bp = Blueprint("balance", __name__, url_prefix="/balance")

NOT_FOUND = "Balance event not found"


def _serialize_event(e) -> dict:
    return {
        "event_id": str(e.event_id),
        "owner": str(e.owner),
        "name": e.name,
        "amount": e.amount,
        "date": str(e.date),
        "category_id": str(e.category_id) if e.category_id is not None else None,
    }


@balance_bp.route('/owner/<owner_id>', methods=["GET"])
def get_balances_by_owner(owner_id: UUID):
    """
    Returns all balance events for a given owner.

    Args:
        owner_id (UUID): the owner's user id
    """
    try:
        events = db.get_balance_events_by_owner(owner_id)
        return jsonify([_serialize_event(e) for e in events]), 200
    except Exception:
        return jsonify({"error": "Could not fetch balance events"}), 500


@balance_bp.route('/<event_id>', methods=["GET"])
def get_balance(event_id: UUID):
    """
    Returns a balance event object from its id

    Args:
        event_id (UUID): the event id
    """
    try:
        event = db.get_balance_event(event_id)
        return jsonify(_serialize_event(event)), 200
    except Exception:
        return jsonify({"error": NOT_FOUND}), 404


@balance_bp.route('/<event_id>', methods=["PUT"])
def put_balance(event_id: UUID):
    """
    Updates a balance event

    Args:
        event_id (UUID): the event id

    ## Query parameters:
        name (str): the event name
        amount (float): the event amount
        category_id (UUID): the id of the expense category to link to
    """
    if not request.args:
        return jsonify({"error": "Missing query parameters"}), 400

    try:
        name = request.args.get('name')
        if request.args.get('amount') is not None:
            amount = float(request.args["amount"])
        else:
            amount = None
        category_id_raw = request.args.get('category_id')
        category_id = UUID(category_id_raw) if category_id_raw else None
        db.update_balance_event(event_id, name, amount, category_id)
        return jsonify({"message": "Updated"}), 200
    except ValueError:
        return jsonify({"error": "Invalid amount or category_id"}), 400
    except Exception:
        return jsonify({"error": NOT_FOUND}), 404


@balance_bp.route('/', methods=["POST"])
def post_balance():
    """
    Creates a new balance event

    ## Body parameters:
        owner (UUID): the event owner
        name (str): the event name
        amount (float): the event amount
        date (str): the event date (in ISO)
        category_id (UUID, optional): the id of the expense category to link to
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    required = ['owner', 'name', 'amount', 'date']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    category_id_raw = request.json.get('category_id')
    try:
        category_id = UUID(category_id_raw) if category_id_raw else None
    except ValueError:
        return jsonify({"error": "Invalid category_id"}), 400

    event_id = uuid4()
    event = BalanceEvent(
        event_id=event_id, owner=request.json['owner'],
        name=request.json['name'], amount=request.json['amount'],
        date=datetime.strptime(request.json['date'], '%Y-%m-%d'),
        category_id=category_id,
    )
    db.insert_balance_event(event)
    return jsonify({
        "event_id": str(event_id),
        "owner": request.json['owner'],
        "name": request.json['name'],
        "amount": request.json['amount'],
        "date": request.json['date'],
        "category_id": str(category_id) if category_id is not None else None,
    }), 201


@balance_bp.route('/<event_id>', methods=["DELETE"])
def delete_balance(event_id: UUID):
    """
    Deletes a balance event

    Args:
        event_id (UUID): the event id
    """
    try:
        db.delete_balance_event(event_id)
        return jsonify({"message": "Deleted"}), 200
    except Exception:
        return jsonify({"error": NOT_FOUND}), 404