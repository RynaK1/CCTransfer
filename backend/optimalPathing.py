import sqlite3
from itertools import product


def getMajorPath(school, major):
    conn = sqlite3.connect('articulations.db')
    cursor = conn.cursor()

    query = f'SELECT * FROM "{school}" WHERE "id" = "{major}"'
    cursor.execute(query)

    majorPath = cursor.fetchone()

    cursor.close()
    conn.close()

    if majorPath == None:
        print("Empty major path detected")
        return []
    
    return eval(majorPath[1])


def find_optimal_path(agreements):
    non_empty_agreements = [agreement for agreement in agreements if agreement]

    # If all agreements are empty, return an empty set and an empty dictionary
    if not non_empty_agreements:
        return set(), {}

    # Flatten the non-empty agreements into a list of sets
    agreement_sets = [set(course for path in agreement for course in path) for agreement in non_empty_agreements]

    # Find the common courses among all non-empty agreements
    common_courses = set.intersection(*agreement_sets)

    # Remove the common courses from each non-empty agreement
    reduced_agreements = [
        [set(path) - common_courses for path in agreement]
        for agreement in non_empty_agreements
    ]

    # Generate all possible combinations of paths
    path_combinations = list(product(*reduced_agreements))

    # If there are no path combinations, return the common courses and their counts
    if not path_combinations:
        overlap_counts = {course: len(non_empty_agreements) for course in common_courses}
        return common_courses, overlap_counts

    # Find the path combinations with the minimum number of courses
    min_courses = min(len(set.union(*path)) for path in path_combinations)
    optimal_paths = [path for path in path_combinations if len(set.union(*path)) == min_courses]

    # Find the optimal path with the most common courses
    max_common_courses = max(len(set.intersection(*path)) for path in optimal_paths)
    optimal_path = next(path for path in optimal_paths if len(set.intersection(*path)) == max_common_courses)

    # Add the common courses back to the optimal path
    optimal_path = set.union(*optimal_path) | common_courses

    # Count the number of overlapping courses for each course in the optimal path
    overlap_counts = {}
    for course in optimal_path:
        count = sum(course in agreement_set for agreement_set in agreement_sets)
        overlap_counts[course] = count

    return optimal_path, overlap_counts



majors = [
    ("DeAnza_to_UCSD", "Anthropology B.A. with Concentration in Archaeology"),
    ("DeAnza_to_SLO", "Anthropology and Geography B.S."),
    ("DeAnza_to_Berkeley", "Anthropology B.A."),
    ("DeAnza_to_UCSD", "Anthropology: Biological Anthropology B.S."),
    ("DeAnza_to_UCSD", "TEST"),
    ("DeAnza_to_UCSD", "Anthropology B.A. with Concentration in Climate Change and Human Solutions")
]


agreements = []
for major in majors:
    agreements.append(getMajorPath(major[0], major[1]))

path, counts = find_optimal_path(agreements)\

print(path)
for course, count in counts.items():
    print(course, ":", count)