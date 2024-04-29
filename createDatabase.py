import sqlite3


conn = sqlite3.connect('raw_articulations.db')

cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS "DeAnza_to_UCSD" (
        id TEXT PRIMARY KEY,
        paths TEXT
    )
''')

data = [
    ("Accounting Minor: Rady School of Management", str(['and', 'ACCT_1A', 'ACCT_1C'])), D
    ("Anthropology B.A. with Concentration in Archaeology", str(['and', 'ANTH_4'])),   D
    ("Anthropology B.A. with Concentration in Biological Anthropology", str(['and', 'ANTH_1'])), D
    ("Anthropology B.A. with Concentration in Climate Change and Human Solutions", str([])), D
    ("Anthropology B.A. with Concentration in Sociocultural Anthropology", str(['ANTH_2'])),
    ("Anthropology: Biological Anthropology B.S.", str(['and', 'ANTH_1', 'BIOL_6A', 'BIOL_6B', 'BIOL_6C', 'CHEM_1A', 'CHEM_1B', 'CHEM_1C', ['choose', '2', ['MATH_12', 'MATH_1A', 'MATH_1B', ['and', 'MATH_1C', 'MATH_1D']]], ['choose', '1', ['MATH_10', 'MATH_17', 'PSYC 15']], 'PSYC_1'])),
    ("Art: Art History/Criticism B.A. (Visual Arts)", str(['and', 'ARTS_2A', 'ARTS_2B', 'ARTS_2C', 'ARTS_2J', 'ARTS_2G', 'F/TV_2A', 'F/TV_2B'])),
]

cursor.executemany('INSERT OR REPLACE INTO "DeAnza_to_UCSD" (id, paths) VALUES (?, ?)', data)
conn.commit()

cursor.close()
conn.close()