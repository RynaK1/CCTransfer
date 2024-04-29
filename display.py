import sqlite3

def print_table_contents(cursor, table_name):
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    print(f"Table: {table_name}")
    for row in rows:
        print(row)
    print()


conn = sqlite3.connect('articulations.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

for table in tables:
    table_name = table[0]
    print_table_contents(cursor, table_name)

cursor.close()
conn.close()