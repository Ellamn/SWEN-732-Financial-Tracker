from flask import Flask

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


@app.route('/')
def hello_world():
    return 'Hello world!'
