"""
Copied from SWEN 610 db utils
"""

import psycopg2
import yaml
import os

def connect():
    config = {}
    yml_path = os.path.join(os.path.dirname(__file__), '../../config/db.yml')
    with open(yml_path, 'r') as file:
        config = yaml.load(file, Loader=yaml.FullLoader)
    return psycopg2.connect(dbname=config['database'],
                            user=config['user'],
                            password=config['password'],
                            host=config['host'],
                            port=config['port'])

def exec_sql_file(path):
    full_path = os.path.join(os.path.dirname(__file__), f'../../{path}')
    conn = connect()
    cur = conn.cursor()
    with open(full_path, 'r') as file:
        cur.execute(file.read())
    conn.commit()
    conn.close()

def exec_get_one(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    one = cur.fetchone()
    conn.close()
    return one

def exec_get_all(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    # https://www.psycopg.org/docs/cursor.html#cursor.fetchall

    list_of_tuples = cur.fetchall()
    conn.close()
    return list_of_tuples

def exec_commit(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    conn.commit()
    conn.close()
    return result

def maybe(val, name : str) -> str:
    """
    Returns \'DEFAULT\' if val is None, otherwise returns \'%(`name`)s\'
    
    <b>This uses string concatenation, not for use with user input (of `name`)</b>
    """
    return 'DEFAULT' if val is None else f'%({name})s'

def make_update_sql(dct : dict, table : str, pk : str) -> str:
    """
    Helper function that generates a sql query that includes all non-null values in dct.
    
    If there are no non-null values in dct, then this throws an assertion error.

    <b>This uses string concatenation, not for use with user input</b>

    Args:
        dct (dict): dictionary of column_name = new_value. 
                    Must contain at least one non-null value
        table (str): the table name to update
        pk (str): primary key on which to update

    Returns:
        str: the sql query (UPDATE `table` SET ... WHERE `pk` = %(`pk`)s)
    """
    sql = f'UPDATE {table} SET'
    for k,v in dct.items():
        if v is not None:
            sql += f'\n{k} = %({k})s,'
    assert sql[-1] == ',', "no valid arguments passed into update function"
    sql = sql[:-1] # get rid of the trailing comma
    
    sql += f'\nWHERE {pk} = %({pk})s'

    return sql