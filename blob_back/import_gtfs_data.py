import sqlite3

conn = sqlite3.connect('gtfs.db')
c = conn.cursor()

c.execute('SELECT stop_id FROM stops')
existing_stops = {row[0] for row in c.fetchall()}
print(existing_stops)

for stop in stops_to_insert:
    if stop[0] not in existing_stops:
        c.execute('INSERT INTO stops (stop_id, stop_name, stop_lat, stop_lon, route_type) VALUES (?, ?, ?, ?, ?)', stop)

conn.commit()
conn.close()