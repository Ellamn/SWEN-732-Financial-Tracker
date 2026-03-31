from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime
from database.src import database as db
from api.src.models import BalanceEvent

balance_bp = Blueprint("balance",__name__,url_prefix="/balance")


@balance_bp.route('/<event_id>', methods=["GET"])
def get_balance(event_id):
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
        return jsonify({"error": "Balance event not found"}), 404


@balance_bp.route('/<event_id>', methods=["PUT"])
def put_balance(event_id):
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
    except:
        return jsonify({"error": "Balance event not found"}), 404


@balance_bp.route('/', methods=["POST"])
def post_balance():
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
        "event_id": str(event_id), "owner": request.json['owner'],
        "name": request.json['name'], "amount": request.json['amount'],
        "date": request.json['date']
    }), 201


@balance_bp.route('/<event_id>', methods=["DELETE"])
def delete_balance(event_id):
    try:
        db.delete_balance_event(event_id)
        return jsonify({"message": "Deleted"}), 200
    except:
        return jsonify({"error": "Balance event not found"}), 404
