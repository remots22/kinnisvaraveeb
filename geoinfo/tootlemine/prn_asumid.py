import json
import requests

prnrest = "https://services7.arcgis.com/JHeJMqXQ296PjBWU/ArcGIS/rest/services/Pärnu_keskuslinna_asumite_piirid/FeatureServer/0/query?where=1=1&outFields=*&f=geojson"

oige = '../prn_asumid.geojson'
vastus = requests.get(prnrest)
andmed = vastus.json()

valmis = {
    "type": "FeatureCollection",
    "name": "prn_asumid",
    "features": []
}
for tunnus in andmed.get("features", []):
# seekord hoitakse asumi nime elemendis "Nimi"
    asumi_nimi = tunnus.get("properties", {}).get("Nimi")
    geomeetria = tunnus.get("geometry")

    if asumi_nimi and geomeetria: #algul paistis osadel olevat puudu
        uus_tunnus = {
            "type": tunnus.get("type"),
            "properties": {
                "asumi_nimi": asumi_nimi
            },
            "geometry": geomeetria
        }
        valmis["features"].append(uus_tunnus)
with open(oige, 'w', encoding='utf-8') as f:
    json.dump(valmis, f, indent=2, ensure_ascii=False)