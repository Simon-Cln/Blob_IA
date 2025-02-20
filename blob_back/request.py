import requests

# Définir l'URL de base
base_url = 'http://127.0.0.1:5000'

# Définir le fichier GTFS
response = requests.post(f'{base_url}/set-gtfs-file', json={'gtfs_file': r'C:\Users\calar\OneDrive\Bureau\blob\shortest_path_paris\gtfs.db'})
print(response.json())

# Récupérer le fichier GTFS
response = requests.get(f'{base_url}/get-gtfs-file')
print(response.json())

# Récupérer les arrêts
response = requests.get(f'{base_url}/get-stops')
print(response.json())
