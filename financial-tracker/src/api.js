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
        throw new Error(`${method} ${path} → ${res.status}`);
    }

    const text = await res.text();

    return text ? JSON.parse(text) : null;
}

// user wrappers 
export const getUserByName = (name) => req("GET", "/users/", null, { name });

export const createUser = (name) => req("POST", "/users/", { name });

// balance (transaction) wrappers 
export const getBalancesByOwner = (owner) => req("GET", `/balance/owner/${owner}`);
export const createBalanceEvent = (owner, name, amount, date) => req("POST", "/balance/", { owner, name, amount: Math.round(amount * 100), date });
export const updateBalanceEvent = (id, name, amount) => req("PUT", `/balance/${id}`, null, { ...(name != null ? { name } : {}), ...(amount != null ? { amount: Math.round(amount * 100) } : {}) });
export const deleteBalanceEvent = (id) => req("DELETE", `/balance/${id}`);

// expense category wrappers 
export const getExpenseCategoriesByOwner = (owner) => req("GET", `/expenses/owner/${owner}`);
export const createExpenseCategory = (owner, name) => req("POST", "/expenses/", { owner, name });
export const updateExpenseCategory = (id, name) => req("PUT", `/expenses/${id}`, null, { name });
export const deleteExpenseCategory = (id) => req("DELETE", `/expenses/${id}`);

// budget goal wrappers 
export const getBudgetGoalsByOwner = (owner) => req("GET", `/goals/owner/${owner}`);
export const createBudgetGoal = (owner, name, amount, achieve_by_date, started_on) => req("POST","/goals/", { owner, name, amount: Math.round(amount * 100), achieve_by_date, started_on });
export const updateBudgetGoal = (id, fields) => req("PUT", `/goals/${id}`, null, {
    ...(fields.name ? { name: fields.name } : {}),
    ...(fields.amount != null ? { amount: String(Math.round(fields.amount * 100)) } : {}),
    ...(fields.achieve_by_date ? { achieve_by_date: fields.achieve_by_date } : {}),
    ...(fields.started_on ? { started_on: fields.started_on } : {}),
});
export const deleteBudgetGoal = (id) => req("DELETE", `/goals/${id}`);

// income source wrappers 
export const createIncomeSource = (owner, name, is_recurring) => req("POST", "/income/", { owner, name, is_recurring });
export const updateIncomeSource = (id, name, is_recurring) => req("PUT", `/income/${id}`, null, { ...(name != null ? { name } : {}), ...(is_recurring != null ? { is_recurring: String(is_recurring) } : {}) });
export const deleteIncomeSource = (id) => req("DELETE", `/income/${id}`);