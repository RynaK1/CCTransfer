import sqlite3
import re
import ast
from itertools import combinations, product

def find_all_paths(expression):
    if not expression:
        return []
    
    def traverse(expr, path=[]):
        if isinstance(expr, list):
            # Recursive case
            operator, *operands = expr
            if operator == 'and':
                combined_paths = [path]
                for operand in operands:
                    combined_paths = [p + p2 for p in combined_paths for p2 in traverse(operand, [])]
                yield from combined_paths
            elif operator == 'choose':
                num_to_choose, courses = operands
                courses = flatten(courses)
                for chosen_courses in combinations(courses, int(num_to_choose)):
                    chosen_paths = [traverse(course, []) if isinstance(course, list) else [[course]] for course in chosen_courses]
                    for chosen_path in product(*chosen_paths):
                        yield path + [item for sublist in chosen_path for item in sublist]
        else:
            # Base case
            if re.match(r'^[\w/]+$', expr):
                yield path + [expr]

    def flatten(lst):
        flat_list = []
        for item in lst:
            if isinstance(item, list):
                operator, *operands = item
                if operator == 'and' or operator == 'choose':
                    flat_list.append(item)
                else:
                    flat_list.extend(flatten(item))
            else:
                flat_list.append(item)
        return flat_list

    all_paths = list(traverse(expression))
    return all_paths


conn = sqlite3.connect('raw_articulations.db')

cursor = conn.cursor()

cursor.execute('SELECT * FROM "DeAnza_to_UCSD"')
rows = cursor.fetchall()

modified_data = []
for row in rows:
    modified_data.append((row[0], str(find_all_paths(ast.literal_eval(row[1])))))

cursor.close()
conn.close()

conn = sqlite3.connect('articulations.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS "DeAnza_to_UCSD" (
        id TEXT PRIMARY KEY,
        paths TEXT
    )
''')

cursor.executemany('INSERT OR REPLACE INTO "DeAnza_to_UCSD" (id, paths) VALUES (?, ?)', modified_data)
conn.commit()

cursor.close()
conn.close()