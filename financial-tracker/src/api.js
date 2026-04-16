const BASE = "http://localhost:5000";

// build request body 
async function req(method, path, body = null, params = null) {
    let url = `${BASE}${path}`;

    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += (url.includes("?") ? "&" : "?") + qs;
    }

    const opts = { method, headers: { "Content-Type": "application/json" } };

    if (body) {
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    if (!res.ok) {
        throw new Error(`${method} ${path} -> ${res.status}`);
    }

    const text = await res.text();

    if (!text) return null;
    
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`${method} ${path} -> response was not valid JSON`);
    }
}

// user wrappers 
export const getUserByName = (name) => req("GET", "/users/", null, { name });

export const createUser = (name) => req("POST", "/users/", { name });

// balance (transaction) wrappers
export const getBalancesByOwner = (owner) => req("GET", `/balance/owner/${owner}`);
export const createBalanceEvent = (owner, name, amount, date) => req("POST", "/balance/", { owner, name, amount: Math.round(amount * 100), date });

export const updateBalanceEvent = (id, name, amount) => {
    const params = {};

    if (name !== null && name !== undefined) {
        params.name = name;
    }

    if (amount !== null && amount !== undefined) {
        params.amount = Math.round(amount * 100);
    }

    return req("PUT", `/balance/${id}`, null, params);
};

export const deleteBalanceEvent = (id) => req("DELETE", `/balance/${id}`);
export const getBalanceEvent = (id) => req("GET", `/balance/${id}`);

// expense category wrappers 
export const getExpenseCategoriesByOwner = (owner) => req("GET", `/expenses/owner/${owner}`);
export const createExpenseCategory = (owner, name) => req("POST", "/expenses/", { owner, name });
export const updateExpenseCategory = (id, name) => req("PUT", `/expenses/${id}`, null, { name });
export const deleteExpenseCategory = (id) => req("DELETE", `/expenses/${id}`);

// income source wrappers 
export const createIncomeSource = (owner, name, is_recurring) => req("POST", "/income/", { owner, name, is_recurring });

export const updateIncomeSource = (id, name, is_recurring) => {
    const params = {};

    if (name !== null && name !== undefined) {
        params.name = name;
    }

    if (is_recurring !== null && is_recurring !== undefined) {
        params.is_recurring = String(is_recurring);
    }

    return req("PUT", `/income/${id}`, null, params);
};

export const deleteIncomeSource = (id) => req("DELETE", `/income/${id}`);

// budget goal wrappers 
export const getBudgetGoalsByOwner = (owner) => req("GET", `/goals/owner/${owner}`);
export const createBudgetGoal = (owner, name, amount, achieve_by_date, started_on) => req("POST", "/goals/", { owner, name, amount, achieve_by_date, started_on });

export const updateBudgetGoal = (id, fields) => {
    const params = {};

    if (fields.name !== null && fields.name !== undefined) {
        params.name = fields.name;
    }

    if (fields.amount !== null && fields.amount !== undefined) {
        params.amount = fields.amount;
    }

    if (fields.achieve_by_date !== null && fields.achieve_by_date !== undefined) {
        params.achieve_by_date = fields.achieve_by_date;
    }

    if (fields.started_on !== null && fields.started_on !== undefined) {
        params.started_on = fields.started_on;
    }

    return req("PUT", `/goals/${id}`, null, params);
};

export const deleteBudgetGoal = (id) => req("DELETE", `/goals/${id}`);