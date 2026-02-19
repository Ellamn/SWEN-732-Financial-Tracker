from utils import *


##############################
#region Goals 
##############################

def get_all_goals():
    sql = 'SELECT * FROM goals'
    result = exec_get_all(sql)
    return result

##############################
#endregion
##############################

##############################
#region Expenses
##############################

def get_all_expenses():
    sql = 'SELECT * FROM expenses'
    result = exec_get_all(sql)
    return result

##############################
#endregion
##############################

##############################
#region Income
##############################

def get_all_income():
    sql = 'SELECT * FROM income'
    result = exec_get_all(sql)
    return result

##############################
#endregion
##############################

##############################
#region Users 
##############################

def get_all_users():
    sql = 'SELECT * FROM users'
    result = exec_get_all(sql)
    return result

##############################
#endregion
##############################

##############################
#region Expense Categories
##############################

def get_all_categories():
    sql = 'SELECT * FROM categories'
    result = exec_get_all(sql)
    return result

##############################
#endregion
##############################