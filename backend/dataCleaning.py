import re
import ast
import sqlite3
from itertools import combinations, product


def create_list(input):
        result = []
        current_word = ""
        
        for char in input:
            if char == " ":
                if current_word:
                    result.append(current_word)
                    current_word = ""
            elif char in ["[", "]"]:
                if current_word:
                    result.append(current_word)
                    current_word = ""
                result.append(char)
            else:
                current_word += char
        
        if current_word:
            result.append(current_word)
        
        return result


def wrangle_data(input):
    if not input:
        return []
    
    input_list = create_list(input)
    output = "["
    for i in range(1, len(input_list)):
        if input_list[i] == '[':
            output += ',' + input_list[i]
        elif input_list[i] == ']':
            output += input_list[i]
        elif input_list[i] == 'AND' or 'CHOOSE' in input_list[i]:
            output += "'" + input_list[i] + "'"
        else:
            output += ",'" + re.sub(r'([a-zA-Z])(\d)', r'\1_\2', input_list[i]) + "'"

    return ast.literal_eval(output)
            

def find_all_paths(expression):
    if not expression:
        return []

    def traverse(expr, path=[]):
        if isinstance(expr, list):
            # Recursive case
            operator, *operands = expr
            if operator == 'AND':
                combined_paths = [path]
                for operand in operands:
                    combined_paths = [p + p2 for p in combined_paths for p2 in traverse(operand, [])]
                yield from combined_paths
            elif operator.startswith('CHOOSE'):
                num_to_choose = int(operator[6:])
                for chosen_courses in combinations(operands, num_to_choose):
                    chosen_paths = [traverse(course, []) if isinstance(course, list) else [[course]] for course in chosen_courses]
                    for chosen_path in product(*chosen_paths):
                        yield path + [item for sublist in chosen_path for item in sublist]
        else:
            # Base case
            if re.match(r'^[\w/]+$', expr):
                yield path + [expr]

    all_paths = list(traverse(expression))
    return all_paths



conn = sqlite3.connect('databases/raw_articulations.db')
cursor = conn.cursor()
conn2 = sqlite3.connect('databases/articulations.db')
cursor2 = conn2.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

for table in tables:
    query = f"SELECT * FROM {table[0]}"
    cursor.execute(query)
    rows = cursor.fetchall()

    modified_data = []
    for row in rows:
        paths = find_all_paths(wrangle_data(row[1]))
        modified_data.append((row[0], str(paths), row[2]))

    query = f'CREATE TABLE IF NOT EXISTS "{table[0]}" (id TEXT PRIMARY KEY, paths TEXT, notes TEXT)'
    cursor2.execute(query)
    query = f'INSERT OR REPLACE INTO "{table[0]}" (id, paths, notes) VALUES (?, ?, ?)'
    cursor2.executemany(query, modified_data)

conn2.commit()

cursor.close()
conn.close()
cursor2.close()
conn2.close()