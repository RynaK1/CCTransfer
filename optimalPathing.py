import sqlite3
import ast


def optimalPathing(data):
    all_courses = set()
    major_courses = {}

    for major, paths_str in data:
        paths = ast.literal_eval(paths_str)
        major_courses[major] = set(course for path in paths for course in path)
        all_courses.update(major_courses[major])

    common_courses = set.intersection(*major_courses.values()) if major_courses else set()

    minimum_courses = set(common_courses)
    for major in major_courses:
        minimum_courses.update(major_courses[major] - common_courses)

    return minimum_courses


conn = sqlite3.connect('articulations.db')

cursor = conn.cursor()

cursor.execute('SELECT * FROM "DeAnza_to_UCSD"')
rows = cursor.fetchall()
print(optimalPathing(rows))


cursor.close()
conn.close()