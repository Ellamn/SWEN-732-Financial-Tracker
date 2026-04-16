from uuid import UUID

from flask import Blueprint, jsonify, request
from database.src import database as db
from api.src.models import IncomeSource

income_bp = Blueprint("income",__name__,url_prefix="/income")

truthy = ["true","t","y","yes","1","absolutamundo"]
falsy = ["false","f","n","no","0","nowayjose"]


@income_bp.route('/<income_id>', methods=["GET"])
def get_income(income_id: UUID):
    """
    Returns an income source object from its id

    Args:
        income_id (UUID): the source id
    """
    try:
        income = db.get_income_source(income_id)
        return jsonify(income.__dict__)
    except Exception:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404


@income_bp.route('/<income_id>', methods=["PUT"])
def put_income(income_id: UUID):
    """
    Updates an income source

    Args:
        income_id (UUID): the source id
    
    ## Query parameters: 
        name (str): the source name
        is_recurring (bool): whether the source is recurring
    """
    if not request.args:
        return jsonify({"error": "Missing query parameters"}), 400

    try:
        name = request.args.get('name')
        # bool parsing
        if request.args.get('is_recurring') is not None:
            is_recurring = request.args["is_recurring"].lower()
            if is_recurring not in truthy and is_recurring not in falsy:
                raise ValueError
            is_recurring = is_recurring in truthy
        else:
            is_recurring = None
        db.update_income_source(income_id, name=name, is_recurring=is_recurring)
        return jsonify({"message": "Updated"}), 200
    except ValueError:
        return jsonify({"error": "Invalid is_recurring"}), 400
    except Exception:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404


@income_bp.route('/', methods=["POST"])
def post_income():
    """
    Creates a new income source

    ## Body parameters:
        owner (UUID): the source owner
        name (str): the source name
        is_recurring (bool): whether the source is recurring
    """
    if not request.json:
        return jsonify({"error": "Missing request body"}), 400
    required = ['owner', 'name', 'is_recurring']
    missing = [f for f in required if f not in request.json]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    body = request.json
    body['owner'] = UUID(body['owner'])
    db.insert_income_source(IncomeSource(**body))
    return {}, 204


@income_bp.route('/<income_id>', methods=["DELETE"])
def delete_income(income_id: UUID):
    """
    Deletes an income source

    Args:
        income_id (UUID): the source id
    """
    try:
        db.delete_income_source(income_id)
        return jsonify({"message": "DELETED"}), 200
    except Exception:
        return jsonify({"error": f"Balance event {income_id} not found"}), 404
