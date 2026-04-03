from flask import Flask
import sys

from api.src.balance import balance_bp
from api.src.expenses import expenses_bp
from api.src.goals import goals_bp
from api.src.income import income_bp
from api.src.users import users_bp

app = Flask(__name__)


app.register_blueprint(balance_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(goals_bp)
app.register_blueprint(income_bp)
app.register_blueprint(users_bp)

# Reference for myself:
# request.method
# request.form = request body
# request.args = query params
# '/<variable>' = url variable
# https://flask.palletsprojects.com/en/stable/api/#flask.Request

@app.route('/')
def hello_world():
    return 'Hello world!'


if __name__ == "__main__":
    # python[3] -m flask --app api/src/server.py run [--debug]
    # python3 -m flask --app api/src/server.py run --debug
    if len(sys.argv) > 1:
        debug = sys.argv[1] == "--debug"
    else:
        debug = False
    app.run(debug=debug)