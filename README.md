## Kinnisvara kaardirakendus & hindade ennustusmudel
**Tallinn | Tartu | Pärnu**

![Coverage](https://img.shields.io/codecov/c/github/remots22/kinnisvaraveeb)
![License](https://img.shields.io/github/license/remots22/kinnisvaraveeb)

![Demo GIF](test.gif)
### Projekti lühitutvustus

Projekti eesmärgiks on visualiseerida Tallinna, Tartu ja Pärnu kinnisvaraturgu ning ennustada kinnisvara hinda aadressi ja muude parameetrite abil (nt üldpind ruutmeetrites, energiaklass, hoone vanus, seisukord, tubade arv jne) põhjal. Visualiseerimiseks kasutatakse geostatistilist interpoleerimismeetodit GAM Kriging, mille abil on võimalik luua sujuvaid kontuurjooni mustrite tõlgendamiseks. Täpsemalt visualiseeritakse kriging meetodil hinnatsoone, hoonete vanust ning hoonete kõrgust. Kontuurjooned on genereeritud vaid aladele, mis on suuremad kui 20 000 ruutmeetrit (20 ha), et visuaalid oleksid anonüümsemad. Hindade ennustamiseks kasutaja sisendi põhjal on treenitud XGBoost mudel. Veebirakendusega saab tutvuda aadressil [https://remots22.github.io/kinnisvaraveeb/](https://remots22.github.io/kinnisvaraveeb/).

Projekt on loodud Tartu Ülikooli “Tudengiprojektide võistluse” raames.


### Andmete kogumine ja töötlemine

Andmeid projekti tarbeks on kogutud Python scraperiga. Scraperi abil koguti andmeid algul ligi 30
erineva muutuja kohta. Esmase analüüsi käigus selgus, et 19 tulbas on kas liiga palju puuduvaid
väärtuseid (>95%) või nende tulpade puudumine mõjutaks ennustusmudeli treenimist minimaalselt.
Seega koguti andmeid järgmiste omaduste kohta: tüüp (korter/maja/majaosa), katastritunnus, rõdu
olemasolu ja/või selle suurus, ehitusaasta, energiaklass, hind, katus, korrus, korruste arv, pindala,
hoone materjal, krundi pindala, seisukord, tubade arv. Andmeid koguti 160 000 kuulutuse kohta.
Peale puhastamist ning liigsete puuduvate väärtustega kuulutuste eemaldamist jäi csv-faili alles
58 478 rida.
Puhastatud andmed sobitati katastritunnuste järgi kokku koordinaatidega (Maa- ja Ruumiameti geo-
portaalist tõmmatud katastriüksuste .shp abil tehtud .geojson failidest). Koordinaatideks lugesin
katastriüksuste hulknurkade keskpunkte ning jätkasin esialgu L-EST97 süsteemiga. Puhastatud
andmetele lisasin ka poodide, restoranide ja kohvikute arvu 500 meetri raadiuses – huvipunktide ko-
ordinaadid on saadud Overpass API kaudu ning tõlgendatud L-EST97 süsteemi. Lisasin ka kauguse
keskusest (Tallinna ja Tartu puhul Raekoja plats, Pärnus Rüütli-Pühavaimu rist) ning kategoorilise
tunnusena asumi nime (saadud Tallinna, Tartu ja Pärnu ARCGIS REST teenustest). Jagasin kuulu-
tused kastidesse ka nt ligikaudsete arhitektuuriajastute järgi – 1880–1919, 1920–1944, 1945–1957,
1958–1972, 1973–1991 jne.
Kogutud andmetest 72% käis korterite kohta, 23% majade kohta ning ülejäänud majaosade kohta.

### Ruumiline interpoleerimine GAM kriging abil
Siledate kontuurkaartide loomiseks kombineerisin üldistatud aditiivmudeli (GAM) krigimisega. GAM
abil on lihtsam mudeldada mittelineaarsete muutujate trende nagu ehitusaasta või hind koordinaatide
funktsioonina.
Kriging on meetod, mille abil on võimalik ennustada väärtuseid kohtades, mille kohta andmed pu-
uduvad. Seda tehakse kasutades teadaolevaid punkte ning kaaludes neid vastavalt kaugusele ja
ruumilisele seosele. Projektis on linnade puhul vaadeldud lähimat 25 punkti ning Eesti kaardi puhul
lähimat 100 punkti.

### Ennustusmudel

RMSE: 299.62 EUR/m²
MAE: 210.51 EUR/m²
R²: 0.9215
MAPE: 7.86%

### Veebirakendus

Veebirakenduse ja ennustusmudeli tarbeks andmete töötlemiseks on valdavalt kasutatud Pythonit.
Kaardikihtide loomiseks on kasutatud PyGam, PyKrige, GeoPandas, Shapely teeke ning QGIS tark-
vara. Veebirakenduses on võimalik lisaks kriging kihile uurida ka nt keskmist hinda ja mediaanhinda
asumiti ning keskmist vanust, mediaanvanust ja ehitusaasta moodi. Eelnevad kihid põhinevad vaid
kuulutustest kogutud andmetel. Veebirakenduses on kasutajal võimalik ala kohal hõljudes või sel-
lele klikates näha selle ala kohta käivat spikrit. Rakendus on kohandatud mugavalt töötama ka
mobiilis. Frontend: React.js, Tailwind CSS, Mapbox GL JS.

### Viited

1. Peek, Annegrete. Üldistatud aditiivne mudel. Bakalaureusetöö, University of Tartu, Faculty of
Mathematics and Informatics, Institute of Mathematical Statistics, 2014. https://dspace.ut.
ee/server/api/core/bitstreams/40c59be7-8999-497e-aa76-373cb1b44532/content
2. University of Tartu. Praktikum 11 Geostatistika (2). 2025. https://tartugeohum.github.io/
geostatistika2.html (Vaadatud: 21 Mai 2025)

### Kontakt
remo.tsernant.rt@gmail.com
