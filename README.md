# Kinnisvara kaardirakendus & hindade ennustusmudel
**Tallinn | Tartu | Pärnu**

![Coverage](https://img.shields.io/codecov/c/github/remots22/kinnisvaraveeb)
![License](https://img.shields.io/github/license/remots22/kinnisvaraveeb)

![Demo GIF](test.png)

- [Projekti ülesehitus](#projekti-ülesehitus)  
- [Andmed](#andmed)
- [Projekti kulg](#projekti-kulg)      
- [Autorid](#autorid)

---

## Projekti ülesehitus

* Frontend 
* Kraapijad
* Catboost voi xgboost
* mermaid diagramm ülesehituse kohta
* Seletada miks ainult need 3 linna - hinnadünaamika
* Link töötavale projektile

---

## Andmed

* Siia jutt kuidas scraperid töötasid, kuidas andmeid puhastasin jne
* võltsandmetega näidised, mõni väike näide kuidas andmed algul olid
* seletada lahti arhitektuuriperioodid - miks nii valisin

---

## Projekti kulg

* Siin räägin millesed probleemid esile kerkisid ja kuidas neid lahendasin - nt postman jne & wayback machine vark

* Esmalt wayback machine
* Analüüs Postmaniga
* Scraperite tegemine, rakendamine
* Avaandmetest (https://avaandmed.eesti.ee/datasets/tallinna-linnaosade-ja-asumite-kaardifailid) tõmbasin .SHP faili ning tegin selle lihtsuse huvites .geojson failiks - lihtsustab kaardirakenduse tegemist.
* Töötlesin tln_asumid.py abil tooreid andmeid - uus geojson fail kus vaid geometry ja asum/linnaosa
* Katsetan veidi streamlitiga - kas kaardirakenduseks mõistlik jne
* vaja kontrollida kas tartul on endine tähtvere vald või mitte - kui on tuleks ilmselt ära võtta
* Tähtvere vald on ka sees - ilmselt peaks ära võtma kuna liiga vähe andmeid (et andmed oleks ühtlased)
* Streamliti kasutades on veidi keerulisem teha kaardirakendusi - disain & paigutus (kuna sisuliselt on eraldi 3 kaardirakendust ja 3 mudelit)
* Välises kaustas (et kaitsta tooreid andmeid) panin andmed kujule hind_rm,x,y (muud elemendid eemaldatud QGIS jaoks). Nüüd on 3 eraldi faili tallinn_punktid.csv, tartu_punktid.csv, pärnu_punktid.csv mille põhjal teha kaardikihid. Kaardikihte ei tee otse labi leafleti andmete kaitsmiseks - leht näeb vaid keskmist asumi kohta (sellep vb peaks ka tahtvere valla ara votma & on anonüümsem)
* Tähtvere vald ära võetud, peaks ühtlustama hiljem QGIS graduated varki


---
## Kasutatud allikad

NB! need peaksid olema viidatud lehel parast ka - igayhel neist eraldi systeem viitamiseks 

https://avaandmed.eesti.ee/datasets/tallinna-linnaosade-ja-asumite-kaardifailid
https://www.arcgis.com/apps/mapviewer/index.html?url=https://services7.arcgis.com/JHeJMqXQ296PjBWU/ArcGIS/rest/services/Keskuslinna_asumite_piirid/FeatureServer&source=sd
https://www.arcgis.com/apps/mapviewer/index.html?url=https://gis.tartulv.ee/arcgis/rest/services/IT/GI_linnaosad/FeatureServer&source=sd

---

## Autorid
* Remo Tsernant – <remo.tsernant.rt@gmail.com>  
* Mihkel Orasmäe - <mihkel.orasmae@gmail.com>
