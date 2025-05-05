const kaart = L.map('kaart');

// siin linnade koordinaadid - nt Tallinna keskpunktiks Viru väljak, Tartus Riia-Turu-Vabaduse rist, Pärnus Tallinna mnt-Rääma-J. V. Jannseni rist
const linnad = {
    tallinn: {
        nimi: 'Tallinn',
        laius: 59.4370,
        pikkus: 24.7536,
        suum: 13
    },
    tartu: {
        nimi: 'Tartu',
        laius: 58.3780,
        pikkus: 26.7290,
        suum: 13
    },
    pärnu: {
        nimi: 'Pärnu',
        laius: 58.3917,
        pikkus: 24.4953,
        suum: 13
    }
};
let markerid = {};

// see linn on default - kuvatakse esimesena
let valitudLinn = 'tallinn';

// siia saab kaardikihte pärast juurde lisada - peaks korrastama veidi ka
let kihid_map = {
    tallinn: {

        asumid: null,
        linnaosad: null,
        miljööalad: null
    },
    tartu: {

        asumid: null,
        miljööalad: null
    },
    pärnu: {
        asumid: null,
        miljööalad: null
    }
};

// legendi olek
let tallinnAsumidLegend = null;




// ** funktsioonid **

// sellega saab külgriba kinni-lahti teha. telefonil oli algul mingisugune jama & kui vajutada ei lähe kinni
// defo uuri seda
function kylgribaToggle() {
    console.log("külgriba klikitud");
    const külgriba = document.getElementById('külgriba');
    külgriba.classList.toggle('peidetud');
    console.log("peidetud class muutus:", külgriba.classList.contains('peidetud'));
}

function alglaadi() {
    // peab uurima kas on paremat valikut - peaks proovima mapbox tiles ka 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(kaart);
    
    // see paneb ajutised markerid linnade jaoks kaardile -pärast tuleks see siit ära võtta
    for (let linnaNimi in linnad) {
        const linn = linnad[linnaNimi];
        const marker = L.marker([linn.laius, linn.pikkus])
            .addTo(kaart)
            .bindPopup(`<b>${linn.nimi}</b>`);
        
        markerid[linnaNimi] = marker;
    }
    
    // ei puutu !!!
    document.querySelectorAll('.kihi-cb').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const linnaNimi = this.name.split('-')[0];
            const kihtNimi = this.value;
            toggleKiht(linnaNimi, kihtNimi, this.checked);
        });
    });
    
    valiLinn('tallinn'); // väike puust linn peaks default nyyd olema
    
    // seda ei tohiks ka puutuda
    // kontrollib kas ccheckbox norm ja ootab veidi et kaart ara laeks
    const tlnAsumidCheckbox = document.getElementById('tln-asumid');
    if (tlnAsumidCheckbox && tlnAsumidCheckbox.checked) {
        setTimeout(() => {
             tlnAsumidCheckbox.dispatchEvent(new Event('change'));
             console.log("Tallinna asumid laadisid ara");
        }, 100);
    }
    
    // seda tuleb uuesti uurida seoses telefoniga
    document.getElementById('menüü-nupp').addEventListener('click', function() {
        document.getElementById('külgriba').classList.toggle('avatud');
    });
    const tilaVark = document.getElementById('külgriba-tila');
    tilaVark.onclick = kylgribaToggle;
    console.log("Külgriba event tootab:", tilaVark);
}

// igale checkboxile
function lisaKihiEventListener(kihinimi, linnaNimi) {
    document.querySelectorAll(`input[name="${kihinimi}"]`).forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleKiht(linnaNimi, this.value, this.checked);
        });
    });
}

// lüüüüüülitab kihte siiiissseee-välja
function toggleKiht(linnaNimi, kiht, olekVeerg) {
    const kihiObjekt = kihid_map[linnaNimi]?.[kiht];

    if (olekVeerg) {
        if (!kihiObjekt) {
            laadiKiht(linnaNimi, kiht);
        } else {
            kihiObjekt.addTo(kaart);
            // see legendi tagasi panemine ajutine - peaks midagi paremat välja mõtlema
            if (linnaNimi === 'tallinn' && kiht === 'asumid') {
                lisaLegendTLNAsumid();
            }
        }
        näitaPopupi(`Kiht "${kiht}" lisatud linnale ${linnad[linnaNimi].nimi}`);
    } else {
        // lülita kiht välja
        if (kihiObjekt) {
            kaart.removeLayer(kihiObjekt);
            if (linnaNimi === 'tallinn' && kiht === 'asumid') {
                eemaldaLegendTLNAsumid();
            }
        }
        näitaPopupi(`Kiht "${kiht}" eemaldatud linnalt ${linnad[linnaNimi].nimi}`);
    }
}


// QGIS abil tegin algul blues color rampiga värvide jaoks ja nüüd ümardasin lähima sajaliseni et visuaalselt oleks norm
function TallinnAsumidVarvid(hind) {
    if (hind === null || hind === undefined) return '#cccccc'; // hall kui peaks mingil pohjusel olema vaartuse asemel sdjhasjfijidjas
    return hind > 4900 ? '#08306b' :
           hind > 4000 ? '#1d6cb1' :
           hind > 3100 ? '#529dcc' :
           hind > 2300 ? '#9ac8e0' :
           hind > 1400 ? '#d1e2f3' :
           hind >= 500 ? '#f7fbff' :
                        '#cccccc'; // aegna puudub kusjuures ja merimetsa vist ka?
}


function lisaLegendTLNAsumid() {
    if (tallinnAsumidLegend) {
        kaart.removeControl(tallinnAsumidLegend);
    }
    tallinnAsumidLegend = L.control({position: 'bottomright'});
    tallinnAsumidLegend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [500, 1400, 2300, 3100, 4000, 4900];
        const labels = [
            '500 - 1400', '1400 - 2300', '2300 - 3100',
            '3100 - 4000', '4000 - 4900', '4900+'
        ];
        const colors = [
            '#f7fbff', '#d1e2f3', '#9ac8e0',
            '#529dcc', '#1d6cb1', '#08306b'
        ];
        div.innerHTML += '<h4>Keskmine €/m²</h4>';
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                labels[i] + '<br>';
        }
        return div;
    };

    tallinnAsumidLegend.addTo(kaart);
}


function eemaldaLegendTLNAsumid() {
    if (tallinnAsumidLegend) {
        kaart.removeControl(tallinnAsumidLegend);
        tallinnAsumidLegend = null;
    }
}

async function laadiKiht(linnaNimi, kiht) {
    let uusKiht;
    const geojsonPathBase = '../geoinfo/'; // kui muudad selle QGIS-i geojsoni asukohta ss muuda seda ka

    switch(kiht) {
        case 'asumid':
            if (linnaNimi === 'tallinn') {
                const geojsonUrl = '/geoinfo/QGIS/tln_asumid_keskmine_eqi.geojson'; 
                console.log(`Attempting to fetch: ${geojsonUrl}`);
                try {
                    const response = await fetch(geojsonUrl);
                    console.log(`Fetch response status: ${response.status}`);
                    if (!response.ok) {
                         console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    
                    uusKiht = L.geoJSON(data, {
                        style: function(feature) {
                            return {
                                fillColor: TallinnAsumidVarvid(feature.properties.hind_rm_mean),
                                weight: 1, // kui seda suuremaks tega saab paksemaks teha
                                opacity: 1,
                                color: 'grey', // piirjoon
                                fillOpacity: 0.7
                            };
                        },
                        onEachFeature: function(feature, layer) {
                            const props = feature.properties;
                            // see jupp võtab sellest samast geojsonist andmed sellex
                            let popupContent = `<b>${props.asumi_nimi || 'Nimetu asum'}</b>`;
                            if (props.hind_rm_mean !== null && props.hind_rm_mean !== undefined) {
                                popupContent += `<br>Keskmine €/m²: ${props.hind_rm_mean.toFixed(2)}`;
                            } else {
                                popupContent += `<br>Keskmine €/m²: Andmed puuduvad`;
                            }
                             if (props.korterite_arv !== null && props.korterite_arv !== undefined) {
                                popupContent += `<br>Korterite arv: ${props.korterite_arv}`;
                            } else {
                            }
                            layer.bindPopup(popupContent);
                        }
                    });
                    lisaLegendTLNAsumid(); // kui kiht laetud, lisab legendi
                } catch (error) {
                    console.error('Error loading Tallinn asumid GeoJSON:', error);
                    näitaPopupi('Viga Tallinna asumite kihi laadimisel.');

                }
            } else {
                 // see prg placeholder
                 uusKiht = L.geoJSON(null, { style: { color: '#4f46e5', weight: 2, opacity: 0.8, fillColor: '#4f46e5', fillOpacity: 0.2 } });
            }
            break;
        case 'linnaosad':
            // siia veel linnaosad vaja panna
             uusKiht = L.geoJSON(null, {
                 style: function() {
                     return {
                         color: '#0ea5e9', weight: 3, opacity: 0.8,
                         fillColor: '#0ea5e9', fillOpacity: 0.15
                     };
                 }
             });
             break;
        case 'miljööalad':
             // siia vaja veel miljööalade vark teha
             uusKiht = L.geoJSON(null, {
                 style: function() {
                     return {
                         color: '#f59e0b', weight: 2, opacity: 0.8,
                         fillColor: '#f59e0b', fillOpacity: 0.25, dashArray: '5, 5'
                     };
                 }
             });
             break;
        default:
            console.warn(`tundmatu tyyp: ${kiht}`);
            return; // katkestab kui kiht not norm
    }
    
    if (uusKiht) {
        // vaatab et poleks duplicate
        if (kihid_map[linnaNimi]?.[kiht]) {
             kaart.removeLayer(kihid_map[linnaNimi][kiht]);
             if (linnaNimi === 'tallinn' && kiht === 'asumid') {
                 eemaldaLegendTLNAsumid();
             }
        }
        
        kihid_map[linnaNimi][kiht] = uusKiht;
        uusKiht.addTo(kaart);
    } else {
         // kui uusKiht pole olemas
         console.log(`Layer ${kiht} ${linnaNimi} pole olemas`);
    }
}

function valiLinn(nimi) {
    if (!linnad[nimi]) return;
    // uuendab valitud linna nuppu
    document.querySelectorAll('.linna-nupp').forEach(nupp => {
        nupp.classList.remove('aktiivne');
    });
    document.getElementById(`${nimi}-nupp`).classList.add('aktiivne');
    
    document.querySelectorAll('.kihi-kontrollerid').forEach(kontroller => {
        kontroller.style.display = 'none';
    });
    document.getElementById(`${nimi}-kihid`).style.display = 'flex';
    
    // see jupp nihutab kaardi valitud linna peale
    kaart.setView([linnad[nimi].laius, linnad[nimi].pikkus], linnad[nimi].suum);
    markerid[nimi].openPopup();
    valitudLinn = nimi;
    
    // võimalik et läheb hiljem tüütuks - peab mõtlema vb kustutada
    näitaPopupi(`Linn valitud: ${linnad[nimi].nimi}`);
}

// naitab seda alumist popupi
function näitaPopupi(tekst) {
    const popupElement = document.getElementById('popup');
    popupElement.textContent = tekst;
    popupElement.classList.add('nähtav');
    
    // see alumine popup sulgub 3 seki parast
    setTimeout(() => {
        popupElement.classList.remove('nähtav');
    }, 3000);
}
window.onload = alglaadi;