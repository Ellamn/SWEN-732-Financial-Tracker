from flask import Blueprint, request, jsonify
from uuid import UUID, uuid4
from datetime import datetime
from database.src import database as db
from api.src.models import BalanceEvent


balance_bp = Blueprint("balance", __name__, url_prefix="/balance")

NOT_FOUND = "Balance event not found"


@balance_bp.route('/owner/<owner_id>', methods=["GET"])
def get_balances_by_owner(owner_id: UUID):
    """
    Returns all balance events for a given owner.

    Args:
        owner_id (UUID): the owner's user id
    """
    try:
        events = db.get_balance_events_by_owner(owner_id)
        return jsonify([{
            "event_id": str(e.event_id),
            "owner": str(e.owner),
            "name": e.name,
            "amount": e.amount,
            "date": str(e.date)
        } for e in events]), 200
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
        return jsonify({
            "event_id": str(event.event_id),
            "owner": str(event.owner),
            "name": event.name,
            "amount": event.amount,
            "date": str(event.date)
        }), 200
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
    """
    if not request.args:
        return jsonify({"error": "Missing query parameters"}), 400

    try:
        name = request.args.get('name')
        if request.args.get('amount') is not None:
            amount = float(request.args["amount"])
        else:
            amount = None
        db.update_balance_event(event_id, name, amount)
        return jsonify({"message": "Updated"}), 200
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400
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
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400

    required = ['owner', 'name', 'amount', 'date']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    event_id = uuid4()
    event = BalanceEvent(
        event_id=event_id, owner=request.json['owner'],
        name=request.json['name'], amount=request.json['amount'],
        date=datetime.strptime(request.json['date'], '%Y-%m-%d')
    )
    db.insert_balance_event(event)
    return jsonify({
        "event_id": str(event_id),
        "owner": request.json['owner'],
        "name": request.json['name'],
        "amount": request.json['amount'],
        "date": request.json['date']
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