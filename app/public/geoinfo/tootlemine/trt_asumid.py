# sama pohimote nagu tln_asumid aga votab arcgis rest mitteametlikud linnaosad - Tartu linna asumid
import json
import requests

trtrest = "https://gis.tartulv.ee/arcgis/rest/services/IT/GI_linnaosad/FeatureServer/0/query?where=1=1&outFields=*&f=geojson"
oige = '../trt_asumid.geojson'

vastus = requests.get(trtrest)
andmed = vastus.json()
valmis = {
    "type": andmed.get("type"),
    "name": "trt_asumid",
    "features": []
}

for tunnus in andmed.get("features", []):
    asumi_nimi = tunnus.get("properties", {}).get("NIMI")

    if asumi_nimi:
        uus_tunnus = {
            "type": tunnus.get("type"),
            "properties": {
                "asumi_nimi": asumi_nimi
            },
            "geometry": tunnus.get("geometry")
        }
        valmis["features"].append(uus_tunnus)

with open(oige, 'w', encoding='utf-8') as f:
    json.dump(valmis, f, indent=2, ensure_ascii=False)
