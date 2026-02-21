from flask import Flask
import sys

from balance import balance_bp
from expenses import expenses_bp
from goals import goals_bp
from income import income_bp
from users import users_bp

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


@app.route('/')
def hello_world():
    return 'Hello world!'


if __name__ == "__main__":
    # python api/src/server.py [--debug]
    # or just use [python -m] flask --app api/src/server.py run [--debug]
    if len(sys.argv) > 1:
        debug = sys.argv[1] == "--debug"
    else:
        debug = False
    app.run(debug=debug)