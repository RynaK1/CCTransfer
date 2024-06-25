import sqlite3
import json

def db_to_json(db_file, json_file):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    data = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Get column names
        column_names = [description[0] for description in cursor.description]
        
        # Convert rows to list of dictionaries
        table_data = []
        for row in rows:
            table_data.append(dict(zip(column_names, row)))
        
        data[table_name] = table_data
    
    conn.close()
    
    # Write to JSON file
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=2)

# Usage
db_to_json('databases/articulations.db', 'databases/articulations.json')