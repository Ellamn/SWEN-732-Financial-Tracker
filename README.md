# SWEN-732-Financial-Tracker

[![codecov](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker/branch/main/graph/badge.svg)](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker)

[![codecov](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker/branch/main/graph/badge.svg)](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Project Overview 
FinTrack is a finance tracker built for students to help them manage thier personal finances. It offers users a lot of flexibility in logging their income, expenses, savings goals, and budget. Data is stored in PostgreSQL and exposed in a Flask RESTful API, and the frontend is built through React. 

## Technologies
| Layer | Technology |
|---|---|
| Frontend | React, Vite, Recharts |
| Backend | Python, Flask |
| Database | PostgreSQL 16 |
| API/Database Testing | pytest |
| Frontend Testing | Vitest, React Testing Library |
| CI | GitHub Actions |
| Coverage | Codecov |

## Project Structure
```
SWEN-732-Financial-Tracker/
├── api/
│   ├── src/                        # API Endpoints 
│   │   ├── server.py         
│   │   ├── balance.py         
│   │   ├── expenses.py        
│   │   ├── goals.py          
│   │   ├── income.py          
│   │   └── users.py
│   │   └── models.py           
│   ├── test/                       # API tests
|   |   ├── conftest.py          
│   │   ├── test_balance_api.py         
│   │   ├── test_expenses_api.py        
│   │   ├── test_goals_api.py           
│   │   ├── test_income_api.py          
│   │   └── test_users_api.py 
│   │   └── test_utils.py                
├── database/
│   ├── src/                        # database funcitons and models 
|   |   ├── models/  
|   |   |   ├── balance_event.py 
|   |   |   ├── budget_goal.py 
|   |   |   ├── expense_category.py
|   |   |   ├── income_source.py 
|   |   |   ├── user.py                        
│   │   ├── database.py        
│   │   └── db_utils.py        
│   ├── config/
│   │   └── db.yml  
│   ├── schema/                     # database schema   
|   |   ├── public/                 # sql statements             
│   └── test/                       # database unit tests
├── financial-tracker/
│   ├── src/
│   |   ├── pages/                  # dashboard, transactions, budget, goals, savings
│   |   ├── components/             # sidebar
│   |   ├── context/                # user login 
│   |   ├── api.js                  # API wrapper functions
│   |   ├── App.jsx
│   |   ├── test/                   # UI tests
├── tests/                          # smoke test
├── requirements.txt
└── .github/workflows/ci.yml
```

## Database configuration

By default the app reads [`database/config/db.yml`](database/config/db.yml) (host `localhost`, database `swen732`, etc.). For CI or any environment where you prefer environment variables, set **`POSTGRES_HOST`** together with **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**, **`POSTGRES_DB`**, and optionally **`POSTGRES_PORT`** (default `5432`). When `POSTGRES_HOST` is set, those variables are used instead of the YAML file. On GitHub Actions, the job runs on the VM (not inside a job container), so use **`POSTGRES_HOST=localhost`** to reach the Postgres service port mapping.

## Installation 
**Backend:**
```bash
git clone https://github.com/Ellamn/SWEN-732-Financial-Tracker.git
cd SWEN-732-Financial-Tracker
python -m pip install -r requirements.txt
```

Ensure PostgreSQL is running and that the variables in 'database/config/db.yml' points to your instance. The schema is created automatically when you run tests or start the application. 

**Frontend:**
```bash
cd financial-tracker
npm install
npm run dev
```
The React dev server starts on `http://localhost:5173` and expects the Flask API on `http://localhost:5000`. Some systems may resolve `localhost` as IPv6 `::1`, in which case simply add `--host ::1` when running flask.

## Usage 
Start the server from the repository root: 

```bash
PYTHONPATH=. python api/src/server.py
```

Navigate to another terminal (keep the server running) and run from the repository root: 
```bash
cd financial-tracker
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Enter a username in the login screen (it will create an account if you do not already have one), and explore the webpage. 

## Running tests locally

Set `PYTHONPATH` to the repository root so `api` and `database` package imports resolve.

**Smoke tests** (no database):

```bash
PYTHONPATH=. pytest tests/ -v
```

**Database tests** (PostgreSQL must be running and reachable via `database/config/db.yml` or `POSTGRES_*`):

```bash
cd database
pytest test/ -v
```

**API tests** (Flask on `http://127.0.0.1:5000` and same database as above):

```bash
# Terminal 1 — from repo root
PYTHONPATH=. python api/src/server.py

# Terminal 2 — from repo root
PYTHONPATH=. pytest api/test/ -v
```

**Frontend tests:**
 
```bash
cd financial-tracker
npm test
```

## Continuous integration

GitHub Actions runs the same flows: PostgreSQL service, database tests, then a background Flask process, then API tests. The workflow sets `POSTGRES_HOST=localhost` (required for VM-hosted jobs) and matching credentials. Coverage results are uploaded to Codecov on every run. 

## Contributing

1. Fork the repository and create a feature branch off of 'main'
2. follow the existing code style 
3. add or update tests for any changed endpoints. All existing tests must pass before opening a PR
4. open a pull request against 'main' with a clear explanation of what you changed and why 
5. at least two team members must approve the PR before it can be merged 

## Contact 
To report a bug, open an issue on [GitHub repository](https://github.com/Ellamn/SWEN-732-Financial-Tracker/issues).
