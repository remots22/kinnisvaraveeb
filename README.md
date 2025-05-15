## Kinnisvara kaardirakendus & hindade ennustusmudel
**Tallinn | Tartu | Pärnu**

![Coverage](https://img.shields.io/codecov/c/github/remots22/kinnisvaraveeb)
![License](https://img.shields.io/github/license/remots22/kinnisvaraveeb)

![Demo GIF](test.png)
### Projekti lühitutvustus

Projekti eesmärgiks on visualiseerida Tallinna, Tartu ja Pärnu kinnisvaraturgu ning ennustada kinnisvara hinda aadressi ja muude parameetrite abil (nt üldpind ruutmeetrites, energiaklass, hoone vanus, seisukord, tubade arv jne) põhjal. Visualiseerimiseks kasutatakse geostatistilist interpoleerimismeetodit GAM Kriging, mille abil on võimalik luua sujuvaid kontuurjooni mustrite tõlgendamiseks. Täpsemalt visualiseeritakse kriging meetodil hinnatsoone, hoonete vanust ning hoonete kõrgust. Kontuurjooned on genereeritud vaid aladele, mis on suuremad kui 20 000 ruutmeetrit (20 ha), et visuaalid oleksid anonüümsemad. Hindade ennustamiseks kasutaja sisendi põhjal on treenitud XGBoost mudel. Veebirakendusega saab tutvuda aadressil [https://remots22.github.io/kinnisvaraveeb/app/](https://remots22.github.io/kinnisvaraveeb/app/).

Projekt on loodud Tartu Ülikooli “Tudengiprojektide võistluse” raames.

### Veebirakenduse ülesehitus

### Visualiseerimiseks kasutatud meetodid

Generaliseeritud aditiivmudel (GAM):

Kriging:

GAM + Kriging:

### Andmete kogumine ja töötlemine

Kraapimine: Andmed on kogutud

Andmete puhastamine ja anonümiseerimine:
