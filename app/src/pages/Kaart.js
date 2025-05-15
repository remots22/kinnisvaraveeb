import React, { useState, useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { ChevronDown, Layers, X } from 'lucide-react'; 
import { JaotisePealkiri } from '../components/UIComponents'; 

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const hinnaVahemikud = [
  { min: 500, tekst: '500 - 1000 €/m²', piirjoon: '#08306b' },
  { min: 1000, tekst: '1000 - 1500 €/m²', piirjoon: '#08306b' },
  { min: 1500, tekst: '1500 - 2000 €/m²', piirjoon: '#08306b' },
  { min: 2000, tekst: '2000 - 2500 €/m²', piirjoon: '#08306b' },
  { min: 2500, tekst: '2500 - 3000 €/m²', piirjoon: '#08306b' },
  { min: 3000, tekst: '3000 - 3500 €/m²', piirjoon: '#08306b' },
  { min: 3500, tekst: '3500 - 4000 €/m²', piirjoon: '#08306b' },
  { min: 4000, tekst: '4000 - 4500 €/m²', piirjoon: '#08306b' },
  { min: 4500, tekst: '4500+ €/m²', piirjoon: '#08306b' },
];

const sinisedVärvid = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
const magmaVärvid = ['#fcfdbf', '#feda8b', '#fca65c', '#f8765c', '#ed4f6b', '#c92a81', '#9b179e', '#6a00a7', '#3b045e'];

const looTäiteVärviAvaldis = (värvid) => [
  'match',
  ['get', 'min_price'],
  500, värvid[0],
  1000, värvid[1],
  1500, värvid[2],
  2000, värvid[3],
  2500, värvid[4],
  3000, värvid[5],
  3500, värvid[6],
  4000, värvid[7],
  4500, värvid[8],
  'rgba(0,0,0,0)' // Vaikimisi läbipaistev
];

const looPiirjooneVärviAvaldis = (stiil) => {
  if (stiil === 'magma') {
    return magmaVärvid[8]; // Tume magma piirjooneks
  } 
  return sinisedVärvid[8]; // Tume sinine piirjooneks
};

const Kaart = () => {
  const kaardiKonteinerRef = useRef(null);
  const kaardiRef = useRef(null); 
  
  const [näitaKihidePaneeli, setNäitaKihidePaneeli] = useState(false); 
  const kihidePaneelRef = useRef(null);
  const kihiLülitiNuppRef = useRef(null);
  const [laiendatudKihiKategooriad, setLaiendatudKihiKategooriad] = useState({ Tallinn: false, Tartu: false, Pärnu: false, Eesti: false });
  const [aktiivseKihiDetailid, setAktiivseKihiDetailid] = useState({ linn: 'Tallinn', stiil: 'magma' }); // Vaikimisi aktiivne kiht

  const linnad = useMemo(() => [
    { nimi: 'Tallinn', koordinaadid: [24.7536, 59.4370], suum: 10 },
    { nimi: 'Tartu', koordinaadid: [26.7290, 58.3780], suum: 11 },
    { nimi: 'Pärnu', koordinaadid: [24.4966, 58.3859], suum: 11 },
  ], []);

  const TALLINN_GEOJSON_RADA = '/geoinfo/QGIS/Linnad/mapbox/tallinn/tallinn.geojson';
  const TALLINN_ALLIKA_ID = 'tallinn-hind-allikas';
  const TARTU_GEOJSON_RADA = '/geoinfo/QGIS/Linnad/mapbox/tartu/tartu.geojson';
  const TARTU_ALLIKA_ID = 'tartu-hind-allikas';
  const PARNU_GEOJSON_RADA = '/geoinfo/QGIS/Linnad/mapbox/parnu/parnu.geojson';
  const PARNU_ALLIKA_ID = 'parnu-hind-allikas';

  const hinnakategooriad = useMemo(() => [
    {
      nimi: 'Eesti',
      alamkihid: []
    },
    {
      nimi: 'Tallinn',
      allikaId: TALLINN_ALLIKA_ID, 
      geoJsonRada: TALLINN_GEOJSON_RADA,
      koordinaadid: linnad.find(l=>l.nimi === 'Tallinn').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Tallinn').suum,
      alamkihid: [
        { id: 'sinine', nimi: 'Hind €/rm (kriging, l_n=25, sinine)', tüüp: 'geojson', kihiIdEesliide: 'tallinn-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } },
        { id: 'magma', nimi: 'Hind €/rm (kriging, l_n=25, magma)', tüüp: 'geojson', kihiIdEesliide: 'tallinn-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } }
      ]
    },
    {
      nimi: 'Tartu',
      allikaId: TARTU_ALLIKA_ID,
      geoJsonRada: TARTU_GEOJSON_RADA,
      koordinaadid: linnad.find(l=>l.nimi === 'Tartu').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Tartu').suum,
      alamkihid: [
        { id: 'sinine', nimi: 'Hind €/rm (kriging, l_n=25, sinine)', tüüp: 'geojson', kihiIdEesliide: 'tartu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } },
        { id: 'magma', nimi: 'Hind €/rm (kriging, l_n=25, magma)', tüüp: 'geojson', kihiIdEesliide: 'tartu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } }
      ]
    },
    {
      nimi: 'Pärnu',
      allikaId: PARNU_ALLIKA_ID,
      geoJsonRada: PARNU_GEOJSON_RADA,
      koordinaadid: linnad.find(l=>l.nimi === 'Pärnu').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Pärnu').suum,
      alamkihid: [
        { id: 'sinine', nimi: 'Hind €/rm (kriging, l_n=25, sinine)', tüüp: 'geojson', kihiIdEesliide: 'parnu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } },
        { id: 'magma', nimi: 'Hind €/rm (kriging, l_n=25, magma)', tüüp: 'geojson', kihiIdEesliide: 'parnu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } }
      ]
    }
  ], [linnad]);

  const vahetaKihiKategooriaLaiendust = (kategooriaNimi) => {
    setLaiendatudKihiKategooriad(eelnev => ({ ...eelnev, [kategooriaNimi]: !eelnev[kategooriaNimi] }));
  };

  const haldaKihiValikut = (linnaNimi, kihiStiiliId) => {
    const praeguneLinnDetailides = aktiivseKihiDetailid?.linn === linnaNimi;
    const praeguneStiilDetailides = aktiivseKihiDetailid?.stiil === kihiStiiliId;
    if (praeguneLinnDetailides && praeguneStiilDetailides) {
      setAktiivseKihiDetailid(null); // tühistab valiku, kui sama kiht uuesti valitakse
    } else {
      setAktiivseKihiDetailid({ linn: linnaNimi, stiil: kihiStiiliId });
    }
  };
  
  useEffect(() => {
    if (kaardiRef.current || !kaardiKonteinerRef.current) return; 
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN') {
      console.warn('Mapbox Access Token is not set.');
      if (kaardiKonteinerRef.current) {
        kaardiKonteinerRef.current.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; font-size: 1.2em; color: red;">Mapboxi ligipääsutõend puudub. Kaarti ei saa kuvada.</div>';
      }
      return;
    }

    kaardiRef.current = new mapboxgl.Map({
      container: kaardiKonteinerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: linnad[0].koordinaadid,
      zoom: linnad[0].suum,
      attributionControl: false
    });

    kaardiRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
    kaardiRef.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    const kohtspikriAken = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    kaardiRef.current.on('load', () => {
      hinnakategooriad.forEach(kategooria => {
        if (kategooria.nimi !== 'Eesti' && kategooria.alamkihid.length > 0) {
          const allikaId = kategooria.allikaId;
          const geoJsonRada = kategooria.geoJsonRada;
          
          if (!kaardiRef.current.getSource(allikaId)) {
            kaardiRef.current.addSource(allikaId, {
              type: 'geojson',
              data: geoJsonRada
            });
          }

          kategooria.alamkihid.forEach(kiht => {
            const mapKihiId = `${kiht.kihiIdEesliide}-${kiht.id}`;
            if (!kaardiRef.current.getLayer(mapKihiId)) {
              kaardiRef.current.addLayer({
                id: mapKihiId,
                type: 'fill',
                source: allikaId,
                paint: kiht.kujundus, 
                layout: {
                  // kihi nähtavusega tegeleb alles kui koik kihid loaded
                  visibility: 'none' 
                }
              });
            }
          });
        }
      });

      // avades aktiivne kiht tallinna magma
      if (aktiivseKihiDetailid && aktiivseKihiDetailid.linn === 'Tallinn' && aktiivseKihiDetailid.stiil === 'magma') {
        const algneKihiId = `${aktiivseKihiDetailid.linn.toLowerCase()}-hind-${aktiivseKihiDetailid.stiil}`;
        console.log("Kaart lähtestatud, vaikimisi kihi laadimise katse:", algneKihiId);
        if (kaardiRef.current.getLayer(algneKihiId)) {
          kaardiRef.current.setLayoutProperty(algneKihiId, 'visibility', 'visible');
          console.log(`Vaikimisi kihi ${algneKihiId} nähtavus seatud: nähtav.`);
        } else {
          console.error(`Vaikimisi kihti ${algneKihiId} ei leitud kaardi laadimisel.`);
        }
      } 


      // see tegeleb GeoJSON kihtidega tooltip poupupi jaoks - siin hetkel mingisugune jama 
      const geoJsonKihiIdd = [];
      hinnakategooriad.forEach(kategooria => {
          if (kategooria.nimi !== 'Eesti' && kategooria.alamkihid && kategooria.allikaId) { 
              kategooria.alamkihid.forEach(alamKiht => {
                  if (alamKiht.tüüp === 'geojson' && alamKiht.kihiIdEesliide && alamKiht.id) {
                      const mapKihiId = `${alamKiht.kihiIdEesliide}-${alamKiht.id}`;
                      geoJsonKihiIdd.push(mapKihiId);
                  }
              });
          }
      });
      console.log("GeoJSON kihtide ID-d kohtspikrite jaoks:", geoJsonKihiIdd);


      // NB! see tegeleb hiire liikumisega & tooltip popupiga - siin jama kus tooltip tekib hiirest liiga kaugele yles
      geoJsonKihiIdd.forEach(kihiId => {
        kaardiRef.current.on('mousemove', kihiId, (sündmus) => {
          if (sündmus.features.length > 0) {
            const omadus = sündmus.features[0];
            const minPrice = omadus.properties.min_price;
            const maxPrice = omadus.properties.max_price;

            kohtspikriAken
              .setLngLat(sündmus.lngLat)
              .setHTML(`Hind: ${minPrice !== undefined && minPrice !== null ? parseFloat(minPrice).toFixed(0) : 'N/A'} - ${maxPrice !== undefined && maxPrice !== null ? parseFloat(maxPrice).toFixed(0) : 'N/A'} €/rm`)
              .addTo(kaardiRef.current);
          }
        });

        kaardiRef.current.on('mouseleave', kihiId, () => {
          kohtspikriAken.remove();
        });
      });
    });

    return () => {
      kohtspikriAken.remove(); 
      if (kaardiRef.current) {
          kaardiRef.current.remove();
          kaardiRef.current = null; 
      }
    };
  }, [linnad, hinnakategooriad]);

  // see uuendab aktiivset kihti
  useEffect(() => {
    if (!kaardiRef.current || !kaardiRef.current.isStyleLoaded()) return;

    hinnakategooriad.forEach(kategooria => {
      if (kategooria.nimi !== 'Eesti' && kategooria.alamkihid) {
        kategooria.alamkihid.forEach(kiht => {
          const mapKihiId = `${kiht.kihiIdEesliide}-${kiht.id}`;
          if (kaardiRef.current.getLayer(mapKihiId)) {
            let peaksOlemaNähtav = false;
            if (aktiivseKihiDetailid && aktiivseKihiDetailid.linn === kategooria.nimi && aktiivseKihiDetailid.stiil === kiht.id) {
              peaksOlemaNähtav = true;
            }
            const praeguneNähtavus = kaardiRef.current.getLayoutProperty(mapKihiId, 'visibility');
            if (peaksOlemaNähtav && praeguneNähtavus !== 'visible') {
              kaardiRef.current.setLayoutProperty(mapKihiId, 'visibility', 'visible');
            } else if (!peaksOlemaNähtav && praeguneNähtavus === 'visible') {
              kaardiRef.current.setLayoutProperty(mapKihiId, 'visibility', 'none');
            }
          }
        });
      }
    });

    // see "lendab" valitud kihi linnani
    if (aktiivseKihiDetailid && aktiivseKihiDetailid.linn) {
        const aktiivneLinnInfo = linnad.find(l => l.nimi === aktiivseKihiDetailid.linn);
        if (aktiivneLinnInfo) {
            kaardiRef.current.flyTo({
                center: aktiivneLinnInfo.koordinaadid,
                zoom: aktiivneLinnInfo.suum,
                essential: true
            });
        }
    }

  }, [aktiivseKihiDetailid, hinnakategooriad, linnad]);

  // Kihimenüü sulgemine klikkides välja
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kihidePaneelRef.current && 
        !kihidePaneelRef.current.contains(event.target) &&
        kihiLülitiNuppRef.current && 
        !kihiLülitiNuppRef.current.contains(event.target)
      ) {
        setNäitaKihidePaneeli(false);
      }
    };

    if (näitaKihidePaneeli) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [näitaKihidePaneeli]);

  const legendiVärvid = useMemo(() => {
    if (aktiivseKihiDetailid?.stiil === 'magma') {
      return magmaVärvid;
    }
    return sinisedVärvid; 
  }, [aktiivseKihiDetailid]);

  const saaAktiivseKihiKirjeldus = () => {
    if (!aktiivseKihiDetailid) return '';
    const kategooria = hinnakategooriad.find(k => k.nimi === aktiivseKihiDetailid.linn);
    const kiht = kategooria?.alamkihid.find(l => l.id === aktiivseKihiDetailid.stiil);
    return kiht ? `Aktiivne kiht: ${aktiivseKihiDetailid.linn} - ${kiht.nimi}` : '';
  };

  const legendiPealkiri = useMemo(() => {
    if (!aktiivseKihiDetailid) return "Vali kiht";
    const kategooria = hinnakategooriad.find(k => k.nimi === aktiivseKihiDetailid.linn);
    const kiht = kategooria?.alamkihid.find(l => l.id === aktiivseKihiDetailid.stiil);
    return kiht ? `${aktiivseKihiDetailid.linn} - ${kiht.nimi}` : "Vali kiht";
  }, [aktiivseKihiDetailid, hinnakategooriad]);

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-4 bg-white shadow-md z-10 flex items-center justify-start">
        <JaotisePealkiri>Kaardirakendus</JaotisePealkiri>
      </div>

      <div ref={kaardiKonteinerRef} className="flex-grow relative">
        {/* Layer Toggle Button */}
        <div className="absolute bottom-4 left-4 z-10">
          <button 
            ref={kihiLülitiNuppRef}
            onClick={() => setNäitaKihidePaneeli(!näitaKihidePaneeli)} 
            className="bg-white p-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Ava/sulge kihtide paneel"
          >
            <Layers size={24} className="text-gray-700" />
          </button>
        </div>

        {/* New Layer Selection Panel */}
        <div 
          ref={kihidePaneelRef} 
          className={`absolute bottom-16 left-4 z-20 bg-white rounded-lg shadow-xl w-72 max-h-[calc(100vh-10rem)] overflow-y-auto p-4 border border-gray-200 transition-opacity duration-300 ease-in-out ${näitaKihidePaneeli ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Kihtide valik</h3>
            <button 
              onClick={() => setNäitaKihidePaneeli(false)} 
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Sulge kihtide paneel"
            >
              <X size={20} />
            </button>
          </div>
          
          {hinnakategooriad.map(kategooria => (
            kategooria.nimi !== 'Eesti' && kategooria.alamkihid && (
              <div key={kategooria.nimi} className="mb-2 last:mb-0">
                <button 
                  onClick={() => vahetaKihiKategooriaLaiendust(kategooria.nimi)} 
                  className="w-full flex justify-between items-center py-2 px-2 text-left font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{kategooria.nimi}</span>
                  <ChevronDown size={20} className={`transform transition-transform duration-200 ${laiendatudKihiKategooriad[kategooria.nimi] ? 'rotate-180' : ''}`} />
                </button>
                {laiendatudKihiKategooriad[kategooria.nimi] && (
                  <div className="pl-3 pt-1 border-l border-gray-200 ml-2">
                    {kategooria.alamkihid.map(kiht => (
                      <button 
                        key={kiht.id} 
                        onClick={() => haldaKihiValikut(kategooria.nimi, kiht.id)}
                        className={`w-full text-left py-1.5 px-2 text-sm rounded-md transition-colors mb-1 last:mb-0 
                                  ${aktiivseKihiDetailid && aktiivseKihiDetailid.linn === kategooria.nimi && aktiivseKihiDetailid.stiil === kiht.id 
                                    ? 'bg-blue-500 text-white font-semibold' 
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {kiht.nimi}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
        
        {/* Legend */}
        {aktiivseKihiDetailid && (
            <div className="absolute bottom-4 right-4 z-10 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg max-w-xs border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 border-b pb-1">{legendiPealkiri}</h4>
                <div className="text-xs text-gray-700">
                    {hinnaVahemikud.map((item, index) => (
                        <div key={index} className="flex items-center mb-1">
                            <span 
                                className="w-4 h-4 inline-block mr-2 border"
                                style={{ backgroundColor: legendiVärvid[index], borderColor: item.piirjoon }}
                            ></span>
                            <span>{item.tekst}</span>
                        </div>
                    ))}
                    <p className="mt-2 text-gray-600 italic text-[11px]">Keskmine m² hind piirkonniti</p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Kaart;
