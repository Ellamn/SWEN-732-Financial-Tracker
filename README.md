# SWEN-732-Financial-Tracker

[![codecov](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker/branch/main/graph/badge.svg)](https://codecov.io/gh/Ellamn/SWEN-732-Financial-Tracker)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Dependencies

From the repository root:

```bash
python -m pip install -r requirements.txt
```

## Database configuration

By default the app reads [`database/config/db.yml`](database/config/db.yml) (host `localhost`, database `swen732`, etc.). For CI or any environment where you prefer environment variables, set **`POSTGRES_HOST`** together with **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**, **`POSTGRES_DB`**, and optionally **`POSTGRES_PORT`** (default `5432`). When `POSTGRES_HOST` is set, those variables are used instead of the YAML file. On GitHub Actions, the job runs on the VM (not inside a job container), so use **`POSTGRES_HOST=localhost`** to reach the Postgres service port mapping.

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

## Continuous integration

GitHub Actions runs the same flows: PostgreSQL service, database tests, then a background Flask process, then API tests. The workflow sets `POSTGRES_HOST=localhost` (required for VM-hosted jobs) and matching credentials.
