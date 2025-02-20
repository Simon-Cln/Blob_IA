import sqlite3

def read_config(config_file):
    config = {}
    with open(config_file, 'r') as file:
        for line in file:
            key, value = line.strip().split('=')
            config[key] = value
    return config

def check_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Récupérer les tables dans la base de données
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in the database:")
    for table in tables:
        print(table[0])

    # Vérifier le contenu de chaque table
    for table in tables:
        print(f"\nContents of {table[0]} table:")
        cursor.execute(f"SELECT * FROM {table[0]} LIMIT 5;") 
        rows = cursor.fetchall()
        for row in rows:
            print(row)

    conn.close()

# Lecture du fichier de configuration
config = read_config('config.txt')
print("Configuration:")
for key, value in config.items():
    print(f"{key}: {value}")

# Chemin de la base de données
gtfs_db_path = f"{config['gtfs']}/gtfs.db"
print(f"\nGTFS Database path: {gtfs_db_path}")

# Vérification des données de la base de données
check_database(gtfs_db_path)