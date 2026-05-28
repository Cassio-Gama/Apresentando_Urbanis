import json
import pyproj

def process_geojson(path, label):
    transformer = pyproj.Transformer.from_crs("epsg:31983", "epsg:4326", always_xy=True)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    stations = []
    for feature in data.get('features', []):
        coords = feature['geometry']['coordinates']
        name = feature['properties'].get('nm_estacao_metro_trem', 'N/A')
        lon, lat = transformer.transform(coords[0], coords[1])
        stations.append({
            "name": name,
            "lat": lat,
            "lng": lon,
            "type": label
        })
    return stations

metro = process_geojson('d:/Estudos/PIADS4/Projeto2/src/assets/geoportal_estacao_metro_v2.geojson', 'Metrô')
trem = process_geojson('d:/Estudos/PIADS4/Projeto2/src/assets/geoportal_estacao_trem_v2.geojson', 'Trem')

all_stations = metro + trem
with open('d:/Estudos/PIADS4/Projeto2/frontend/public/stations.json', 'w', encoding='utf-8') as f:
    json.dump(all_stations, f, ensure_ascii=False)

print(f"Processed {len(all_stations)} stations.")
