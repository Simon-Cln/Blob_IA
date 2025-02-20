import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from heapq import heappop, heappush
from math import acos, cos, sin, radians
import logging
from logging.handlers import RotatingFileHandler
from math import radians, sin, cos, sqrt, atan2


app = Flask(__name__)
CORS(app)
CONFIG_FILE = 'config.txt'
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"An error occurred: {str(e)}")
    return jsonify(error=str(e)), 500


def read_config():
    config = {}
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as file:
            for line in file:
                key, value = line.strip().split('=')
                config[key] = value
    return config

def save_config(config):
    with open(CONFIG_FILE, 'w') as file:
        for key, value in config.items():
            file.write(f"{key}={value}\n")



@app.route('/set-gtfs-file', methods=['POST'])
def set_gtfs_file():
    data = request.json
    gtfs_file = data['gtfs_file']
    
    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Invalid file'}), 400
    
    config = read_config()
    config['gtfs'] = gtfs_file
    save_config(config)
    
    return jsonify({'message': 'GTFS file set successfully'}), 200

@app.route('/get-gtfs-file', methods=['GET'])
def get_gtfs_file():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if gtfs_file is None:
        return jsonify({'error': 'GTFS file not set'}), 404
    print(f"GTFS file used: {gtfs_file}") 
    return jsonify({'gtfs_file': gtfs_file})


@app.route('/get-olympic-sites', methods=['GET'])
def get_olympic_sites():
    olympic_sites = [
        {"name": "Stade de France (Rugby à 7, Athlétisme)", "lat": 48.9244, "lon": 2.3601},
        {"name": "Parc des Princes (Football)", "lat": 48.8414, "lon": 2.253},
        {"name": "Roland Garros (Tennis)", "lat": 48.847, "lon": 2.2497},
        {"name": "Palais Omnisports de Paris-Bercy (Basket, Gymnastique artistique)", "lat": 48.8381, "lon": 2.3786},
        {"name": "Champs-Élysées (Cyclisme sur route)", "lat": 48.8698, "lon": 2.3072},
        {"name": "Tour Eiffel (Beach-volley)", "lat": 48.8584, "lon": 2.2945},
        {"name": "Grand Palais (Taekwondo, Escrime)", "lat": 48.8661, "lon": 2.3125},
        {"name": "Place de la Concorde (Breaking, Skateboard, Basket 3x3, BMX freestyle)", "lat": 48.8656, "lon": 2.3212},
        {"name": "Hôtel de Ville (Athlétisme - marathon)", "lat": 48.8566, "lon": 2.3522},
        {"name": "Pont d'Iéna / Trocadéro (Cérémonie d'ouverture, Athlétisme - marche)", "lat": 48.8625, "lon": 2.2884},
        {"name": "Pont Alexandre-III (Natation en eau libre)", "lat": 48.8651, "lon": 2.3136},
        {"name": "Invalides (Judo, Lutte)", "lat": 48.8566, "lon": 2.3125},
        {"name": "Champs de Mars (Tir à l'arc)", "lat": 48.8561, "lon": 2.2974},
        {"name": "Porte de Versailles (Handball)", "lat": 48.8325, "lon": 2.2876},
        {"name": "Arena de la Chapelle (Badminton, Gymnastique rythmique)", "lat": 48.8966, "lon": 2.3594},
        {"name": "Le Bourget (Escalade)", "lat": 48.9326, "lon": 2.4183},
        {"name": "Centre Aquatique (Natation synchronisée, Plongeon)", "lat": 48.9386, "lon": 2.3625},
        {"name": "La Défense Arena (Natation, Water-polo)", "lat": 48.8926, "lon": 2.2234},
        {"name": "Bois de Boulogne (Boxe)", "lat": 48.8629, "lon": 2.2461}
    ]
    return jsonify(olympic_sites)

@app.route('/get-stops-coordinates', methods=['GET'])
def get_stops_coordinates():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if not gtfs_file:
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Database file not found'}), 404

    transport_types = request.args.getlist('transport_types[]', type=int)
    print(f"Received transport types: {transport_types}")  # Log received transport types

    if not transport_types:
        print("No transport types provided")
        return jsonify([])

    try:
        db = sqlite3.connect(gtfs_file)
        cursor = db.cursor()
        placeholders = ', '.join('?' for _ in transport_types)
        query = f"""
        SELECT stops.stop_id, stops.stop_name, stops.stop_lat, stops.stop_lon, routes.route_type 
        FROM stops
        JOIN stops_routes ON stops.stop_id = stops_routes.stop_id
        JOIN routes ON stops_routes.route_id = routes.route_id 
        WHERE routes.route_type IN ({placeholders})
        """
        print(f"Executing query: {query} with parameters: {transport_types}")
        cursor.execute(query, transport_types)
        stops = cursor.fetchall()
        stop_data = [{'stop_id': stop[0], 'stop_name': stop[1], 'lat': stop[2], 'lon': stop[3], 'type': stop[4]} for stop in stops]
        print("Fetched stops data:", stop_data[:10])  # Log first 10 stops
        if not stop_data:
            print("No stops data fetched from the database")
    except sqlite3.Error as e:
        print(f"SQLite error: {e.args[0]}")  # Log SQLite error
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Log unexpected error
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        db.close()

    return jsonify(stop_data)


@app.route('/get-stops', methods=['GET'])
def get_stops():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    print(f"GTFS file path in Flask app: {gtfs_file}")  # Debug log

    if not gtfs_file:
        print(f"GTFS file not set")  # Debug log
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        print(f"Database file not found: {gtfs_file}")  # Debug log
        return jsonify({'error': 'Database file not found'}), 404

    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 5))

    try:
        db = sqlite3.connect(gtfs_file)
        cursor = db.cursor()
        cursor.execute('SELECT stop_id, stop_name FROM stops LIMIT ? OFFSET ?', (limit, offset))
        stops = cursor.fetchall()
        stop_data = [{'stop_id': stop[0], 'stop_name': stop[1]} for stop in stops]
        #print(f"Stops fetched from database: {stop_data}")  # Debug log
    except sqlite3.Error as e:
        print(f"SQLite error: {e.args[0]}")  # Debug log
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if db:
            db.close()

    return jsonify(stop_data)

@app.route('/get-all-data/<table_name>', methods=['GET'])
def get_all_data(table_name):
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if not gtfs_file:
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Database file not found'}), 404

    try:
        db = sqlite3.connect(gtfs_file)
        cursor = db.cursor()
        query = f"SELECT * FROM {table_name}"
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        data = [dict(zip(columns, row)) for row in rows]
        #print(f"Fetched data from {table_name}: {data}")  # Debug log
    except sqlite3.Error as e:
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if db:
            db.close()

    return jsonify(data)

def stop_exists(db, stop_id):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM stops WHERE stop_id = ?", (stop_id,))
    result = cursor.fetchone()
    return result[0] > 0

@app.route('/get-stop-by-name', methods=['GET'])
def get_stop_by_name():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if not gtfs_file:
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Database file not found'}), 404

    stop_name = request.args.get('stop_name')

    try:
        db = sqlite3.connect(gtfs_file)
        cursor = db.cursor()
        cursor.execute("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_name LIKE ?", (f'%{stop_name}%',))
        stops = cursor.fetchall()
        stop_data = [{'stop_id': stop[0], 'stop_name': stop[1], 'lat': stop[2], 'lon': stop[3]} for stop in stops]
    except sqlite3.Error as e:
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if db:
            db.close()

    return jsonify(stop_data)

def get_stop_id_by_name(db, stop_name):
    cursor = db.cursor()
    cursor.execute("SELECT stop_id FROM stops WHERE stop_name = ?", (stop_name,))
    result = cursor.fetchone()
    return result[0] if result else None



def getFunctionSuccessorsByStopId(db, modes, withTimes=True):
    cursor = db.cursor()
    modes += [-1]
    query = """
        SELECT from_stop_id, to_stop_id, departure_time, travel_time, route_type 
        FROM timetable 
        WHERE route_type IN ({})
        ORDER BY from_stop_id, to_stop_id, departure_time, travel_time
    """.format(','.join('?' for _ in modes))
    cursor.execute(query, modes)

    localStorage = {}
    for connection in cursor:
        from_stop_id, to_stop_id, departure_time, travel_time, route_type = connection
        if from_stop_id not in localStorage:
            localStorage[from_stop_id] = {}
        if to_stop_id not in localStorage[from_stop_id]:
            localStorage[from_stop_id][to_stop_id] = []
        localStorage[from_stop_id][to_stop_id].append((departure_time, travel_time, route_type))

    #print(f"Successors map: {localStorage}")

    if withTimes:
        def minValueFromStartTime(expanded, arrival_time):
            arrival_time %= 24 * 60
            stop_id, valuations = expanded
            minimum = float('inf')
            for departure_time, travel_time, route_type in valuations:
                if route_type in modes:
                    if departure_time == -1:
                        minimum = arrival_time + travel_time
                    elif departure_time >= arrival_time and departure_time + travel_time < minimum:
                        minimum = departure_time + travel_time
            return travel_time, stop_id, minimum
    else:
        def minValueFromStartTime(expanded, arrival_time):
            stop_id, valuations = expanded
            minimum = float('inf')
            for departure_time, travel_time, route_type in valuations:
                if route_type in modes:
                    if travel_time < minimum:
                        minimum = travel_time
            return minimum, stop_id, 0

    def voisins(stop_id, arrival_time):
        expanded = localStorage.get(stop_id, {}).items()
        return sorted(map(lambda succ: minValueFromStartTime(succ, arrival_time), expanded))

    return voisins

def compute_shortest_path(db, from_stop_name, to_stop_name, modes, departure_time_string):
    from_stop_id = get_stop_id_by_name(db, from_stop_name)
    to_stop_id = get_stop_id_by_name(db, to_stop_name)

    if not from_stop_id:
        print(f"Start stop {from_stop_name} does not exist in the database.")
        return [], 0
    if not to_stop_id:
        print(f"End stop {to_stop_name} does not exist in the database.")
        return [], 0

    departure_time = 0 if departure_time_string == "" else minutes(departure_time_string)
    voisins = getFunctionSuccessorsByStopId(db, modes, not not departure_time)

    M = set()
    d = {from_stop_id: 0}
    t = {from_stop_id: departure_time}
    p = {}
    suivants = [(0, from_stop_id, departure_time)]

    while suivants:
        opt_travel_time, curr_stop, arrival_time = heappop(suivants)
        if curr_stop in M:
            continue

        M.add(curr_stop)

        for travel_time, next_stop, next_departure_time in voisins(curr_stop, arrival_time):
            if next_stop in M:
                continue
            if next_departure_time == float('inf'):
                continue
            dy = opt_travel_time + travel_time
            if next_stop not in d or d[next_stop] > dy:
                d[next_stop] = dy
                heappush(suivants, (dy, next_stop, next_departure_time))
                p[next_stop] = curr_stop
                t[next_stop] = arrival_time + travel_time

    try:
        stop_ids = [to_stop_id]
        stop_times = [t[to_stop_id]]
        x = to_stop_id
        while x != from_stop_id:
            x = p[x]
            stop_ids.insert(0, x)
            stop_times.insert(0, t[x])
    except KeyError:
        print(f"No path found from {from_stop_id} to {to_stop_id}")
        return [], 0

    cursor = db.cursor()
    path = []
    for stop_id, arrival_time in zip(stop_ids, stop_times):
        cursor.execute("SELECT stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = ?", (stop_id,))
        result = cursor.fetchone()
        if result:
            stop_name, stop_lat, stop_lon = result
            path.append({
                'stop_id': stop_id,
                'stop_name': stop_name,
                'lat': stop_lat,
                'lon': stop_lon,
                'time': arrival_time
            })
            
    for i in range(1, len(path)):
        time_diff = path[i]['time'] - path[i - 1]['time']
        print(f"Time from {path[i - 1]['stop_name']} to {path[i]['stop_name']}: {time_diff} minutes")
    
    temps_exec = path[-1]['time'] - path[0]['time']  

    print(f"Path found: {path}")
    return path, temps_exec


@app.route('/get-shortest-path', methods=['GET'])
def get_shortest_path():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if not gtfs_file:
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Database file not found'}), 404

    start_stop = request.args.get('start_stop')
    end_stop = request.args.get('end_stop')
    transport_types = request.args.getlist('transport_types[]', type=int)
    departure_time_string = request.args.get('departure_time', "08:00")  

    olympic_sites = [
        {"name": "Stade de France (Rugby à 7, Athlétisme)", "lat": 48.9244, "lon": 2.3601},
        {"name": "Parc des Princes (Football)", "lat": 48.8414, "lon": 2.253},
        {"name": "Roland Garros (Tennis)", "lat": 48.847, "lon": 2.2497},
        {"name": "Palais Omnisports de Paris-Bercy (Basket, Gymnastique artistique)", "lat": 48.8381, "lon": 2.3786},
        {"name": "Champs-Élysées (Cyclisme sur route)", "lat": 48.8698, "lon": 2.3072},
        {"name": "Tour Eiffel (Beach-volley)", "lat": 48.8584, "lon": 2.2945},
        {"name": "Grand Palais (Taekwondo, Escrime)", "lat": 48.8661, "lon": 2.3125},
        {"name": "Place de la Concorde (Breaking, Skateboard, Basket 3x3, BMX freestyle)", "lat": 48.8656, "lon": 2.3212},
        {"name": "Hôtel de Ville (Athlétisme - marathon)", "lat": 48.8566, "lon": 2.3522},
        {"name": "Pont d'Iéna / Trocadéro (Cérémonie d'ouverture, Athlétisme - marche)", "lat": 48.8625, "lon": 2.2884},
        {"name": "Pont Alexandre-III (Natation en eau libre)", "lat": 48.8651, "lon": 2.3136},
        {"name": "Invalides (Judo, Lutte)", "lat": 48.8566, "lon": 2.3125},
        {"name": "Champs de Mars (Tir à l'arc)", "lat": 48.8561, "lon": 2.2974},
        {"name": "Porte de Versailles (Handball)", "lat": 48.8325, "lon": 2.2876},
        {"name": "Arena de la Chapelle (Badminton, Gymnastique rythmique)", "lat": 48.8966, "lon": 2.3594},
        {"name": "Le Bourget (Escalade)", "lat": 48.9326, "lon": 2.4183},
        {"name": "Centre Aquatique (Natation synchronisée, Plongeon)", "lat": 48.9386, "lon": 2.3625},
        {"name": "La Défense Arena (Natation, Water-polo)", "lat": 48.8926, "lon": 2.2234},
        {"name": "Bois de Boulogne (Boxe)", "lat": 48.8629, "lon": 2.2461}
    ]

    try:
        db = sqlite3.connect(gtfs_file)

        print(f"Received start_stop: {start_stop}, end_stop: {end_stop}")

        start_site_data = next((site for site in olympic_sites if site['name'] == start_stop), None)
        end_site_data = next((site for site in olympic_sites if site['name'] == end_stop), None)

        print(f"Found start_site_data: {start_site_data}, end_site_data: {end_site_data}")

        if not start_site_data or not end_site_data:
            return jsonify({'error': 'One or both Olympic sites not found'}), 404

        start_stop = find_nearest_stop(db, start_site_data['lat'], start_site_data['lon'], transport_types)
        end_stop = find_nearest_stop(db, end_site_data['lat'], end_site_data['lon'], transport_types)

        if not start_stop or not end_stop:
            return jsonify({'error': 'No nearby transport stops found'}), 404

        path_data, temps_exec = compute_shortest_path(db, start_stop[1], end_stop[1], transport_types, departure_time_string)

        if path_data:
            start_info = {'stop_id': start_stop[0], 'stop_name': start_stop[1], 'lat': path_data[0]['lat'], 'lon': path_data[0]['lon'], 'time': path_data[0]['time']}
            end_info = {'stop_id': end_stop[0], 'stop_name': end_stop[1], 'lat': path_data[-1]['lat'], 'lon': path_data[-1]['lon'], 'time': path_data[-1]['time']}
            path_data.insert(0, start_info)
            path_data.append(end_info)

        response = {
            'path': path_data,
            'total_time': temps_exec
        }

    except sqlite3.Error as e:
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if db:
            db.close()

    return jsonify(response)



def minutes(time_str):
    """Convert a time string (HH:MM) to minutes past midnight."""
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes



def find_nearest_stop(db, lat, lon, transport_types):
    cursor = db.cursor()
    placeholders = ', '.join('?' for _ in transport_types)
    query = f"""
    SELECT stops.stop_id, stops.stop_name, stops.stop_lat, stops.stop_lon, routes.route_type 
    FROM stops
    JOIN stops_routes ON stops.stop_id = stops_routes.stop_id
    JOIN routes ON stops_routes.route_id = routes.route_id 
    WHERE routes.route_type IN ({placeholders})
    """
    cursor.execute(query, transport_types)
    stops = cursor.fetchall()
    
    nearest_stop = None
    min_distance = float('inf')
    for stop in stops:
        distance = calculate_distance(lat, lon, stop[2], stop[3])
        if distance < min_distance:
            min_distance = distance
            nearest_stop = stop

    return nearest_stop


def calculate_distance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, sqrt, atan2
    R = 6371.0
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


from heapq import heappush, heappop
from math import sqrt

def compute_heuristic(stop_id, target_stop_id, stop_coords):
    lat1, lon1 = stop_coords[stop_id]
    lat2, lon2 = stop_coords[target_stop_id]
    return sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

from collections import deque

def compute_shortest_path_blob(db, from_stop_name, to_stop_name, modes, departure_time_string):
    from_stop_id = get_stop_id_by_name(db, from_stop_name)
    to_stop_id = get_stop_id_by_name(db, to_stop_name)

    if not from_stop_id:
        print(f"Start stop {from_stop_name} does not exist in the database.")
        return [], 0
    if not to_stop_id:
        print(f"End stop {to_stop_name} does not exist in the database.")
        return [], 0

    departure_time = 0 if departure_time_string == "" else minutes(departure_time_string)
    voisins = getFunctionSuccessorsByStopId(db, modes, not not departure_time)

    cursor = db.cursor()
    cursor.execute("SELECT stop_id, stop_lat, stop_lon FROM stops")
    stop_coords = {row[0]: (row[1], row[2]) for row in cursor.fetchall()}

    visited = set()
    queue = deque([(from_stop_id, departure_time)])
    parents = {}
    times = {from_stop_id: departure_time}

    while queue:
        curr_stop, arrival_time = queue.popleft()
        if curr_stop in visited:
            continue

        visited.add(curr_stop)

        if curr_stop == to_stop_id:
            break

        for travel_time, next_stop, next_departure_time in voisins(curr_stop, arrival_time):
            if next_stop not in visited and next_departure_time != float('inf'):
                queue.append((next_stop, arrival_time + travel_time))
                if next_stop not in times or times[next_stop] > arrival_time + travel_time:
                    times[next_stop] = arrival_time + travel_time
                    parents[next_stop] = curr_stop

    try:
        stop_ids = [to_stop_id]
        stop_times = [times[to_stop_id]]
        x = to_stop_id
        while x != from_stop_id:
            x = parents[x]
            stop_ids.insert(0, x)
            stop_times.insert(0, times[x])
    except KeyError:
        print(f"No path found from {from_stop_id} to {to_stop_id}")
        return [], 0

    cursor = db.cursor()
    path = []
    for stop_id, arrival_time in zip(stop_ids, stop_times):
        cursor.execute("SELECT stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = ?", (stop_id,))
        result = cursor.fetchone()
        if result:
            stop_name, stop_lat, stop_lon = result
            path.append({
                'stop_id': stop_id,
                'stop_name': stop_name,
                'lat': stop_lat,
                'lon': stop_lon,
                'time': arrival_time
            })

    for i in range(1, len(path)):
        time_diff = path[i]['time'] - path[i - 1]['time']
        print(f"Time from {path[i - 1]['stop_name']} to {path[i]['stop_name']}: {time_diff} minutes")

    temps_exec = path[-1]['time'] - path[0]['time'] 

    print(f"Path found: {path}")
    return path, temps_exec


@app.route('/get-shortest-path-blob', methods=['GET'])
def get_shortest_path_a_star():
    config = read_config()
    gtfs_file = config.get('gtfs', None)
    if not gtfs_file:
        return jsonify({'error': 'GTFS file not set'}), 404

    if not os.path.isfile(gtfs_file):
        return jsonify({'error': 'Database file not found'}), 404

    start_stop = request.args.get('start_stop')
    end_stop = request.args.get('end_stop')
    transport_types = request.args.getlist('transport_types[]', type=int)
    departure_time_string = request.args.get('departure_time', "08:00")
    
    olympic_sites = [
        {"name": "Stade de France (Rugby à 7, Athlétisme)", "lat": 48.9244, "lon": 2.3601},
        {"name": "Parc des Princes (Football)", "lat": 48.8414, "lon": 2.253},
        {"name": "Roland Garros (Tennis)", "lat": 48.847, "lon": 2.2497},
        {"name": "Palais Omnisports de Paris-Bercy (Basket, Gymnastique artistique)", "lat": 48.8381, "lon": 2.3786},
        {"name": "Champs-Élysées (Cyclisme sur route)", "lat": 48.8698, "lon": 2.3072},
        {"name": "Tour Eiffel (Beach-volley)", "lat": 48.8584, "lon": 2.2945},
        {"name": "Grand Palais (Taekwondo, Escrime)", "lat": 48.8661, "lon": 2.3125},
        {"name": "Place de la Concorde (Breaking, Skateboard, Basket 3x3, BMX freestyle)", "lat": 48.8656, "lon": 2.3212},
        {"name": "Hôtel de Ville (Athlétisme - marathon)", "lat": 48.8566, "lon": 2.3522},
        {"name": "Pont d'Iéna / Trocadéro (Cérémonie d'ouverture, Athlétisme - marche)", "lat": 48.8625, "lon": 2.2884},
        {"name": "Pont Alexandre-III (Natation en eau libre)", "lat": 48.8651, "lon": 2.3136},
        {"name": "Invalides (Judo, Lutte)", "lat": 48.8566, "lon": 2.3125},
        {"name": "Champs de Mars (Tir à l'arc)", "lat": 48.8561, "lon": 2.2974},
        {"name": "Porte de Versailles (Handball)", "lat": 48.8325, "lon": 2.2876},
        {"name": "Arena de la Chapelle (Badminton, Gymnastique rythmique)", "lat": 48.8966, "lon": 2.3594},
        {"name": "Le Bourget (Escalade)", "lat": 48.9326, "lon": 2.4183},
        {"name": "Centre Aquatique (Natation synchronisée, Plongeon)", "lat": 48.9386, "lon": 2.3625},
        {"name": "La Défense Arena (Natation, Water-polo)", "lat": 48.8926, "lon": 2.2234},
        {"name": "Bois de Boulogne (Boxe)", "lat": 48.8629, "lon": 2.2461}
    ]

    try:
        db = sqlite3.connect(gtfs_file)

        start_site_data = next((site for site in olympic_sites if site['name'] == start_stop), None)
        end_site_data = next((site for site in olympic_sites if site['name'] == end_stop), None)

        if not start_site_data or not end_site_data:
            return jsonify({'error': 'One or both Olympic sites not found'}), 404

        start_stop = find_nearest_stop(db, start_site_data['lat'], start_site_data['lon'], transport_types)
        end_stop = find_nearest_stop(db, end_site_data['lat'], end_site_data['lon'], transport_types)

        if not start_stop or not end_stop:
            return jsonify({'error': 'No nearby transport stops found'}), 404

        path_data, temps_exec = compute_shortest_path_blob(db, start_stop[1], end_stop[1], transport_types, departure_time_string)

        if path_data:
            start_info = {'stop_id': start_stop[0], 'stop_name': start_stop[1], 'lat': path_data[0]['lat'], 'lon': path_data[0]['lon'], 'time': path_data[0]['time']}
            end_info = {'stop_id': end_stop[0], 'stop_name': end_stop[1], 'lat': path_data[-1]['lat'], 'lon': path_data[-1]['lon'], 'time': path_data[-1]['time']}
            path_data.insert(0, start_info)
            path_data.append(end_info)

        response = {
            'path': path_data,
            'total_time': temps_exec
        }

    except sqlite3.Error as e:
        return jsonify({'error': f'SQLite error: {e.args[0]}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if db:
            db.close()

    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
    