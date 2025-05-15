import json

fail1 = '../t02_41_asum.geojson'
fail2 = '../tln_asumid.geojson'

# loeb tooret faili avaandmetest
with open(fail1, 'r', encoding='utf-8') as f:
    andmed = json.load(f)

# siia tuleb asum, linnaosa ja geometry
struk = {
    "type": andmed.get("type"),
    "name": "tln_asumid",
    "features": []
}

# loob uue tunnuse ainult vajalike elementidega ja lisab nad struk placeholderisse
for tunnus in andmed.get("features", []):
    uus_tunnus = {
        "type": tunnus.get("type"),
        "properties": {
            "asumi_nimi": tunnus.get("properties", {}).get("asumi_nimi"),
            "linnaosa_n": tunnus.get("properties", {}).get("linnaosa_n")
        },
        "geometry": tunnus.get("geometry")
    }
    struk["features"].append(uus_tunnus)

# kirjutab struk sisu faili "tln_asumid.geojson" - peaks asuma geoinfo folderis
with open(fail2, 'w', encoding='utf-8') as f:
    json.dump(struk, f, indent=2, ensure_ascii=False)