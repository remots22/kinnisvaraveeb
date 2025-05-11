const { useState, useEffect, useRef, useMemo } = React;

// siin L-EST97 epsg:3301 koordinaatsysteem - kui otsustad kihil kasutada 2gs84 ss muuda see siin ära
const estCRS = new L.Proj.CRS('EPSG:3301',
  '+proj=lcc +lat_1=59.33333333333334 +lat_2=58 +lat_0=57.51755393055556 +lon_0=24 +x_0=500000 +y_0=6375000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
    origin: [40500, 9700000],
    bounds: L.bounds([40500, 5993000], [1064500, 7017000])
  }
);

const Icon = ({ name, size = 20, className = '' }) => {
  const iconRef = useRef(null);
  
  useEffect(() => {
    if (iconRef.current && typeof feather !== 'undefined') {
      feather.replace({
        'width': size,
        'height': size
      });
    }
  }, [name, size]);
  
  return React.createElement('i', { 
    ref: iconRef,
    'data-feather': name, 
    className: className
  });
};
// hiljem lihtsam tegeleda  :ddDD
const KaartKomponent = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-4 md:p-6 ${className}`}>
    {children}
  </div>
);
const JaotisePealkiri = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">{children}</h2>
);

// ylemine osa kylgribal
const navElemendidKonstant = [
  { nimi: 'Kaart', ikoon: <Icon name="map-pin" size={20} />, leht: 'map' },
  { nimi: 'Töölaud', ikoon: <Icon name="layout" size={20} />, leht: 'dashboard' },
  { nimi: 'Ennustusmudel', ikoon: <Icon name="dollar-sign" size={20} />, leht: 'prediction' },
];

// alumine osa kylgribal
const muuElemendidKonstant = [
  { nimi: 'Info', ikoon: <Icon name="help-circle" size={20} />, leht: 'info' }, //sellega kusjuures vahel mingisugune bug - ilmub vahel yleval ja vahel all
  { nimi: 'Allikad', ikoon: <Icon name="database" size={20} />, leht: 'allikad' },
];


const Külgriba = ({ praeguneLeht, määraPraeguneLeht, kasMobiiliMenüüAvatud: mobileOpen, lülitaMobiiliMenüü: toggleMobile }) => {
  const [aktiivseIndikaatoriStiil, määraAktiivseIndikaatoriStiil] = useState({ top: 0, height: 0, opacity: 0 });
  const navRef = useRef(null);
  const külgribaNavLingidRef = useRef({}); 
  const esmaneLaadimineTehtud = useRef(false); 

  useEffect(() => {
    const aktiivneLingiElement = külgribaNavLingidRef.current[praeguneLeht];
    if (aktiivneLingiElement && navRef.current) {
      const top = aktiivneLingiElement.offsetTop;
      const height = aktiivneLingiElement.offsetHeight;
      
      määraAktiivseIndikaatoriStiil({
        top: top,
        height: height,
        opacity: 1,
      });

      if (!esmaneLaadimineTehtud.current) {
        setTimeout(() => {
          esmaneLaadimineTehtud.current = true;
        }, 50); 
      }
    } else {
      const isMainNavItem = navElemendidKonstant.some(item => item.leht === praeguneLeht);
      if (!isMainNavItem) {
        määraAktiivseIndikaatoriStiil(prev => ({ ...prev, opacity: 0 }));
      } else if (navRef.current && !aktiivneLingiElement) {
        määraAktiivseIndikaatoriStiil(prev => ({ ...prev, opacity: 0 }));
      }
    }
  }, [praeguneLeht, mobileOpen]); 


  const NavLink = ({ item, isSubItem = false }) => (
    <button
      ref={el => külgribaNavLingidRef.current[item.leht] = el} 
      onClick={() => {
        määraPraeguneLeht(item.leht);
        if (mobileOpen) toggleMobile();
      }}
      className={`relative z-10 flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none
        ${praeguneLeht === item.leht ? 'text-white' : 'text-gray-600 hover:text-gray-800'}
        ${isSubItem ? 'pl-10' : ''}`}
    >
      {item.ikoon}
      <span>{item.nimi}</span>
    </button>
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-700">Kinnisvara</h1>
        <button onClick={toggleMobile} className="md:hidden text-gray-600 hover:text-gray-800">
          <Icon name="x" size={24} />
        </button>
      </div>
      <nav ref={navRef} className="relative py-6 px-4 space-y-2 flex-grow">
        <div
          className={`absolute bg-blue-600 rounded-lg shadow-md pointer-events-none
            ${esmaneLaadimineTehtud.current ? 'transition-all duration-300 ease-in-out' : ''}`}
          style={{
            left: '1rem', 
            right: '1rem', 
            top: `${aktiivseIndikaatoriStiil.top}px`,
            height: `${aktiivseIndikaatoriStiil.height}px`,
            opacity: aktiivseIndikaatoriStiil.opacity,
            zIndex: 0, 
          }}
        />
        {navElemendidKonstant.map((item) => 
          <NavLink key={item.nimi + "_main"} item={item} />
        )}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Muu</h3>
          <div className="mt-2 space-y-1">
            {muuElemendidKonstant.map((item) => 
              <button
                key={item.nimi + "_muu"} 
                onClick={() => {
                  määraPraeguneLeht(item.leht);
                  if (mobileOpen) toggleMobile();
                }}
                className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none
                  ${praeguneLeht === item.leht ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}
                  pl-10`}
              >
                {item.ikoon}
                <span>{item.nimi}</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

const SelectGroup = ({ options, selectedValue, onSelect, label, containerClass = 'w-full', buttonPadding = 'px-4 py-1.5' }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);
  const buttonRefs = useRef({}); 
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const selectedIndex = options.findIndex(option => option === selectedValue);
    const activeButtonElement = buttonRefs.current[selectedIndex];
    
    if (activeButtonElement && containerRef.current) {
      const indicatorLeft = activeButtonElement.offsetLeft - containerRef.current.scrollLeft;

      setIndicatorStyle({
        left: indicatorLeft, 
        width: activeButtonElement.offsetWidth,
        opacity: 1,
      });
      if (!initialLoadDone.current) {
        setTimeout(() => initialLoadDone.current = true, 50);
      }
    } else if (options.length > 0 && !activeButtonElement) {
        const firstButtonElement = buttonRefs.current[0];
        if (firstButtonElement && containerRef.current) {
             const indicatorLeft = firstButtonElement.offsetLeft - containerRef.current.scrollLeft;
             setIndicatorStyle({
                 left: indicatorLeft,
                 width: firstButtonElement.offsetWidth,
                 opacity: 1,
             });
             if (!initialLoadDone.current) {
                 setTimeout(() => initialLoadDone.current = true, 50);
             }
        }
    }
  }, [selectedValue, options, containerRef.current?.scrollLeft]); 


  return (
    <div className={containerClass}> 
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div 
        ref={containerRef} 
        className="relative bg-gray-200 p-1 rounded-lg shadow-sm flex space-x-1 w-full overflow-x-auto"
      > 
        <div
          className={`absolute bg-white rounded shadow 
            ${initialLoadDone.current ? 'transition-all duration-300 ease-in-out' : ''}`}
          style={{
            top: '0.25rem', 
            bottom: '0.25rem', 
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
            zIndex: 0,
          }}
        />
        {options.map((option, index) => (
          <button
            key={option} 
            ref={el => buttonRefs.current[index] = el} 
            onClick={() => onSelect(option)}
            type="button" 
            className={`relative z-10 ${buttonPadding} text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none flex items-center justify-center whitespace-nowrap
              ${selectedValue === option 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-800' 
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};


const PillSelector = ({ label, option1, option2, selectedOption, onSelect }) => {
  const isOption1Selected = selectedOption === option1;
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative flex w-full bg-gray-200 rounded-full p-1 cursor-pointer">
        <div 
          className={`absolute top-1 bottom-1 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out`}
          style={{
            width: 'calc(50% - 0.25rem)', 
            left: isOption1Selected ? '0.25rem' : 'calc(50% + 0.125rem)', 
          }}
        />
        <button
          type="button"
          onClick={() => onSelect(option1)}
          className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium text-center rounded-full focus:outline-none transition-colors duration-300
            ${isOption1Selected ? 'text-blue-600' : 'text-gray-600 hover:text-gray-700'}`}
        >
          {option1}
        </button>
        <button
          type="button"
          onClick={() => onSelect(option2)}
          className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium text-center rounded-full focus:outline-none transition-colors duration-300
            ${!isOption1Selected ? 'text-blue-600' : 'text-gray-600 hover:text-gray-700'}`}
        >
          {option2}
        </button>
      </div>
    </div>
  );
};


// seda peaks vb tulevikus ümber tegema - nt vb mitu erinevat legendi vms kui mitu kihti korraga lahti
const Kaardivaade = () => {
  console.log('[Kaardivaade Component] Rendering...');
  const hinnavahemikud = [
    // see prg ainult GAM kriging jaoks
    { color: 'bg-blue-50', range: '855 - 1355 €/m²' },
    { color: 'bg-blue-200', range: '1355 - 1855 €/m²' },
    { color: 'bg-blue-300', range: '1855 - 2355 €/m²' },
    { color: 'bg-blue-500', range: '2355 - 2855 €/m²' },
    { color: 'bg-blue-700', range: '2855 - 3355 €/m²' },
    { color: 'bg-blue-900', range: '3555+ €/m²' },
  ];

  const linnad = useMemo(() => [
    { name: 'Tallinn', coords: [59.4370, 24.7536], zoom: 11 },
    { name: 'Tartu', coords: [58.3780, 26.7290], zoom: 12 },
    { name: 'Pärnu', coords: [58.3859, 24.4966], zoom: 12 },
  ], []);

  const [valitudLinnaIndeks, määraValitudLinnaIndeks] = useState(0);

  const [näitaKihtideMenüüd, määraNäitaKihtideMenüüd] = useState(false);
  const kihtideMenüüRef = useRef(null); 
  const kaardiRef = useRef(null); 
  const kaardiKonteinerRef = useRef(null); 
  const [leafletLoaded, setLeafletLoaded] = useState(false); // 

  const saadavalKihtideAndmed = useMemo(() => [
    { id: 'eestiGamKriging', name: 'Eesti GAM kriging kiht (test)' }, 
    { id: 'satelliteView', name: 'Satelliitvaade' },
    { id: 'pointsOfInterest', name: 'Huvipunktid' },
    { id: 'transport', name: 'Transpordiühendused' },
  ], []);

  const kihiDetailideMap = useMemo(() => 
    new Map(saadavalKihtideAndmed.map(kiht => [kiht.id, kiht])), 
    [saadavalKihtideAndmed]
  );

  const [järjestatudKihiIdd, määraJärjestatudKihiIdd] = useState(() => 
    saadavalKihtideAndmed.map(k => k.id)
  );

  const [aktiivsedKihid, määraAktiivsedKihid] = useState(() => {
    const algneAktiivne = {};
    saadavalKihtideAndmed.forEach((kiht, indeks) => {
      algneAktiivne[kiht.id] = indeks === 0; 
    });
    return algneAktiivne;
  });

  const lülitaKihiAktiivneOlek = (kihiId) => {
    määraAktiivsedKihid(eelmine => ({ ...eelmine, [kihiId]: !eelmine[kihiId] }));
  };
  
  const valitudLinn = linnad[valitudLinnaIndeks];

  useEffect(() => {
    setLeafletLoaded(true);
  }, []);



  // sellega laetakse geojson kihid - lisa siia juurde & muuda jarjekorda 
  const laadiGeoJsonKiht = async (kihiId) => {
    if (!kaardiRef.current || !leafletLoaded) return;
    if (kihidMap[kihiId]) { 
      // kui kiht aktiivne ja malus lisa kaardile
      if (aktiivsedKihid[kihiId] && kaardiRef.current && !kaardiRef.current.hasLayer(kihidMap[kihiId])){
        kihidMap[kihiId].addTo(kaardiRef.current);
        if (kihiId === 'eestiGamKriging') {
          kihidMap[kihiId].bringToFront();
        }
      }
      return; 
    }

    let url;
    let styleFn;

    switch(kihiId) {
      case 'eestiGamKriging':
        url = '../geoinfo/QGIS/GAMKrig_Eesti3.geojson'; // uurida kuidas muutub kui panna 25 asemel nt 50 lahimat punkti -kas teeb ääred paremaks
        styleFn = (feature) => ({
          fillColor: EestiGamKrigingVarvid(feature.properties.price_range),
          weight: 1, // siin mingi glitch ?? muutub jooksvalt kui panna tallinna pealt tartu peale
          opacity: 0.6, 
          color: 'grey', 
          fillOpacity: 0.6,
          className: 'overlay-blend-multiply' // kattuvad kihid lahevad multiply blendiga - peaks uurima kas midagi muud parem
        });
        break;
      // uued geojson kihid tuleks lisada siia
      default:
        console.warn(`Ei leitud seadistust kihile: ${kihiId}`);
        return;
    }

    try {
      console.log(`Kiht laadimisel: ${kihiId} (${url})`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`miski juhtus!!!! ${url}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // muudab epsg:3301 -> epsg:4326
      const geoJsonLayer = L.Proj.geoJson(data, {
        coordsToLatLng: function (coords) {
          const projectedCoords = L.Proj.projection.project({x: coords[0], y: coords[1]});
          return new L.LatLng(projectedCoords.y, projectedCoords.x);
        },
        style: styleFn,
        pane: 'gamKrigingPane',
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.price_range) {
            layer.bindPopup(`<b>Hinnavahemik:</b> ${feature.properties.price_range} €/m²`);
          }

        }
      });
      console.log(`[laadiGeoJsonKiht] Created Leaflet layer for ${kihiId} with coordinate transformation:`, geoJsonLayer); // DEBUG

      määraKihidMap(prev => ({ ...prev, [kihiId]: geoJsonLayer }));
      
      if (aktiivsedKihid[kihiId]) {
        geoJsonLayer.addTo(kaardiRef.current);
        try {
          const bounds = geoJsonLayer.getBounds();
          kaardiRef.current.fitBounds(bounds, { padding: [50, 50] });
          console.log(`kaardi bounds norm ${kihiId}`);
        } catch (error) {
          console.error(`kaardi bounds not norm ${kihiId}:`, error);
        }
      }
      console.log(`GeoJSON kiht ${kihiId} laetud ja ${aktiivsedKihid[kihiId] ? 'lisatud kaardile' : 'valmis lisamiseks'}`);

    } catch (error) {
      console.error(`Viga ${kihiId} laadimisel: `, error);
      // vb peaks andma teavituse kasutajale ka - popup kui ei toota
    }
  };

  useEffect(() => {
    if (!leafletLoaded || typeof L === 'undefined' || !kaardiKonteinerRef.current) {
        return; // ootab kuni leaflet laetud
    }
    
    if (!kaardiRef.current) {
        const { coords, zoom } = linnad[valitudLinnaIndeks];
        const kaart = L.map(kaardiKonteinerRef.current, {
            center: coords,
            zoom: zoom,
            zoomControl: false
        });

        kaart.createPane('gamKrigingPane');
        kaart.getPane('gamKrigingPane').style.zIndex = 999;
        console.log('[Direct Test] Created custom pane with z-index:', kaart.getPane('gamKrigingPane').style.zIndex);
        
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &amp; <a href="http://stamen.com" target="_blank">Stamen Design</a>'
        }).addTo(kaart);

        // see muudab koordinaatsysteemi L-EST97 -> wgs84
        console.log('koordinaatsysteemi muutmine prg');
        
        fetch('../geoinfo/QGIS/GAMKrig_Eesti3.geojson')
          .then(response => {
            console.log('Status:', response.status);
            if (!response.ok) {
              throw new Error(`[Proj4Leaflet Test] not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('[Proj4Leaflet Test] GeoJSON data parsed');
            if (data && data.features && data.features.length > 0) {
              console.log('[Proj4Leaflet Test] First feature properties:', JSON.stringify(data.features[0].properties, null, 2));
              console.log('[Proj4Leaflet Test] Sample coordinates:', JSON.stringify(data.features[0].geometry.coordinates[0][0], null, 2));
              const testLayer = L.Proj.geoJson(data, {
                coordsToLatLng: function (coords) {
                  const projectedCoords = L.Proj.projection.project({x: coords[0], y: coords[1]});
                  return new L.LatLng(projectedCoords.y, projectedCoords.x);
                },
                style: function(feature) {
                  return {
                    fillColor: EestiGamKrigingVarvid(feature.properties.price_range),
                    weight: 2,
                    opacity: 0.6,
                    color: 'white', 
                    dashArray: '3',
                    fillOpacity: 0.6,
                    className: 'overlay-blend-multiply'
                  };
                },
                pane: 'gamKrigingPane',
                onEachFeature: function(feature, layer) {
                  if (feature.properties && feature.properties.price_range) {
                    layer.bindPopup(`<b>Hinnavahemik:</b> ${feature.properties.price_range} €/m²`);
                  }
                }
              });
              
              // siin lisatakse kaardile - vaata mix ei tule vahel kuhu console log panna
              testLayer.addTo(kaart);
              console.log('koik norm kihi lisamisel');

              try {
                const bounds = testLayer.getBounds();
                console.log('[Proj4Leaflet Test] Layer bounds:', bounds);
                kaart.fitBounds(bounds, { padding: [50, 50] });
                console.log('[Proj4Leaflet Test] Map fitted to bounds');
              } catch (error) {
                console.error('[Proj4Leaflet Test] Error fitting bounds:', error);
                // kui kihini zoomimine ei onnestu paneb yldiselt eesti alale
                kaart.setView([58.5953, 25.0136], 7);
              }
            } else {
              console.error('[Proj4Leaflet Test] No features found in GeoJSON');
            }
          })
          .catch(error => {
            console.error('[Proj4Leaflet Test] Error loading or processing GeoJSON:', error);
          });




        kaardiRef.current = kaart;
        console.log('[Kaardivaade useEffect] Map instance ASSIGNED to kaardiRef.current:', kaardiRef.current);
    } else {
        console.log('[Kaardivaade useEffect] CONDITION NOT MET: kaardiRef.current ALREADY EXISTS:', kaardiRef.current);
    }

    // siin kihtide nähtavuse vark - aktiivsedKihid ja detailsedKihid olekutele NB!!!
    järjestatudKihiIdd.forEach(kihiId => {
      if (aktiivsedKihid[kihiId] && !kihidMap[kihiId]) {
        if (kihiId === 'eestiGamKriging') {
          laadiGeoJsonKiht(kihiId);
        }
      }
    });
    
    // sellega saab kaardi ara votta
    return () => {
      if (kaardiRef.current) {
        if(kaardiKonteinerRef.current && kaardiRef.current._container === kaardiKonteinerRef.current) {
             kaardiRef.current.remove();
        }
        kaardiRef.current = null;
        console.log('kaart kadunud kaardiref null.');
      }
    };
  }, [leafletLoaded, linnad, valitudLinnaIndeks]); // leaflet peab laetud olema

   // kui linn muutub uuenda
   useEffect(() => {
    if (kaardiRef.current && leafletLoaded) {
      const { coords, zoom } = linnad[valitudLinnaIndeks];
      kaardiRef.current.setView(coords, zoom, {
          animate: true, 
          pan: {
              duration: 0.5 
          }
      });
      
      // const linnaNimi = linnad[valitudLinnaIndeks].name.toLowerCase();
      if (aktiivsedKihid['eestiGamKriging'] && !kihidMap['eestiGamKriging']) {
        laadiGeoJsonKiht('eestiGamKriging');
      }
    }
  }, [valitudLinnaIndeks, linnad, leafletLoaded]);
  

  useEffect(() => {
    const handleVäljaspoolKlõps = (event) => {
      if (kihtideMenüüRef.current && !kihtideMenüüRef.current.contains(event.target)) {
        määraNäitaKihtideMenüüd(false);
      }
    };
    document.addEventListener("mousedown", handleVäljaspoolKlõps);
    return () => document.removeEventListener("mousedown", handleVäljaspoolKlõps);
  }, []);

  // sellega saab liigutada yles-alla kihti : D
  const liigutaKihti = (indeks, suund) => {
    const uuedJärjestatudKihiIdd = [...järjestatudKihiIdd];
    const liigutatavElement = uuedJärjestatudKihiIdd[indeks];
    
    if (suund === 'up' && indeks > 0) {
      uuedJärjestatudKihiIdd.splice(indeks, 1); 
      uuedJärjestatudKihiIdd.splice(indeks - 1, 0, liigutatavElement); 
    } else if (suund === 'down' && indeks < uuedJärjestatudKihiIdd.length - 1) {
      uuedJärjestatudKihiIdd.splice(indeks, 1); 
      uuedJärjestatudKihiIdd.splice(indeks + 1, 0, liigutatavElement); 
    }
    määraJärjestatudKihiIdd(uuedJärjestatudKihiIdd);
  };

  const suumiSisse = () => kaardiRef.current?.zoomIn();
  const suumiVälja = () => kaardiRef.current?.zoomOut();

  const [kihidMap, määraKihidMap] = useState({});

  // kihtide aktiivsus sark vark
  useEffect(() => {
    if (!kaardiRef.current || !leafletLoaded) return;

    järjestatudKihiIdd.forEach(kihiId => {
      const kihtObjekt = kihidMap[kihiId];
      const onAktiivne = aktiivsedKihid[kihiId]; // kui kihil ID aktiivne
      console.log(`[useEffect Layer Management] Processing kihtId: ${kihiId}, Aktiivne: ${onAktiivne}, Kiht Objekt:`, kihtObjekt); // DEBUG

      if (onAktiivne) {
        if (!kihtObjekt) {
          // kiht on märgitud aktiivseks, aga pole veel laetud -> kutsu laadimisfunktsioon
          if (kihiId === 'eestiGamKriging') { 
            laadiGeoJsonKiht(kihiId);
          }
        } else {
          // vaatab kas kiht ikka kaardil
          if (!kaardiRef.current.hasLayer(kihtObjekt)) {
            kihtObjekt.addTo(kaardiRef.current);
          }
          // kihi paigutus - algul GAM kiht pannakse peale
          if (kihiId === 'eestiGamKriging') {
            kihtObjekt.bringToFront();
          } else {
          }
        }
      } else {
        // kiht EI OLE aktiivne
        if (kihtObjekt && kaardiRef.current.hasLayer(kihtObjekt)) {
          // kui kiht on laetud ja kaardil eemalda
          kaardiRef.current.removeLayer(kihtObjekt);
          console.log(`Kiht ${kihiId} eemaldatud kaardilt.`);
        }
      }
    });
  }, [aktiivsedKihid, kihidMap, järjestatudKihiIdd, leafletLoaded]);

  const TallinnAsumidVarvid = (hind) => {
    if (hind === null || hind === undefined) return '#cccccc';
    return hind > 4900 ? '#08306b' :
           hind > 4000 ? '#1d6cb1' :
           hind > 3100 ? '#529dcc' :
           hind > 2300 ? '#9ac8e0' :
           hind > 1400 ? '#d1e2f3' :
           hind >= 500 ? '#f7fbff' :
                        '#cccccc';
  }
  
  const TartuAsumidVarvid = (hind) => {
    if (hind === null || hind === undefined) return '#cccccc';
    return hind > 3500 ? '#08306b' : 
           hind > 3000 ? '#2979b9' : 
           hind > 2500 ? '#73b2d8' : 
           hind > 2000 ? '#c8dcf0' : 
           hind >= 1700 ? '#f7fbff' : 
                        '#cccccc';
  }
  
  const PärnuAsumidVarvid = (hind) => {
    if (hind === null || hind === undefined) return '#cccccc';
    return hind > 3000 ? '#08306b' : 
           hind > 2500 ? '#2979b9' : 
           hind > 2000 ? '#73b2d8' : 
           hind > 1500 ? '#c8dcf0' : 
           hind >= 1400 ? '#f7fbff' :
                        '#cccccc'; 
  }

  const EestiGamKrigingVarvid = (priceRangeStr) => {
    console.log('[EestiGamKrigingVarvid] Input:', priceRangeStr); // DEBUG
    if (!priceRangeStr || typeof priceRangeStr !== 'string') {
      console.log('[EestiGamKrigingVarvid] Returning default (invalid input): #cccccc'); // DEBUG
      return '#cccccc'; 
    }

    const parts = priceRangeStr.split('-');
    if (parts.length === 0) {
      console.log('[EestiGamKrigingVarvid] Returning default (no parts after split): #cccccc'); // DEBUG
      return '#cccccc';
    }

    const lowerBoundStr = parts[0].trim();
    const lowerBound = parseInt(lowerBoundStr, 10);
    console.log('[EestiGamKrigingVarvid] Parsed lowerBound:', lowerBound); // DEBUG
    
    if (isNaN(lowerBound)) {
       console.log('[EestiGamKrigingVarvid] Returning default (lowerBound is NaN): #cccccc'); // DEBUG
      return '#cccccc';
    }

    let color = '#cccccc';
    if (lowerBound >= 3555) color = '#08306b';
    else if (lowerBound >= 2855) color = '#1d6cb1';
    else if (lowerBound >= 2355) color = '#529dcc';
    else if (lowerBound >= 1855) color = '#9ac8e0'; 
    else if (lowerBound >= 1355) color = '#d1e2f3'; 
    else if (lowerBound >= 855) color = '#f7fbff';
    
    console.log('[EestiGamKrigingVarvid] Returning color:', color, 'for lowerBound:', lowerBound); // DEBUG
    return color;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Leaflet CSS ja JS ei ole enam siin otse JSX-is */}
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <JaotisePealkiri>Kaardirakendus</JaotisePealkiri>
        <div className="relative" ref={kihtideMenüüRef}>
          <button 
            onClick={() => määraNäitaKihtideMenüüd(!näitaKihtideMenüüd)}
            className="p-2 bg-white rounded-md shadow hover:bg-gray-100 flex items-center space-x-2"
          >
            <Icon name="layers" size={20} className="text-gray-600" />
            <span className="text-sm text-gray-700">Kihid</span>
            <Icon name="chevron-down" size={16} className={`text-gray-500 transition-transform duration-200 ${näitaKihtideMenüüd ? 'rotate-180' : ''}`} />
          </button>
          {näitaKihtideMenüüd && (
            <div 
              className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-30 border border-gray-200"
            >
              <div className="p-3 space-y-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 px-1.5">Kaardikihid</h4>
                {järjestatudKihiIdd.map((kihtId, indeks) => {
                  const kiht = kihiDetailideMap.get(kihtId);
                  if (!kiht) return null; 
                  return (
                    <div key={kiht.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-md group">
                      <label className="flex items-center space-x-2 cursor-pointer flex-grow mr-2"> 
                        <input 
                          type="checkbox" 
                          checked={aktiivsedKihid[kiht.id] || false} 
                          onChange={() => lülitaKihiAktiivneOlek(kiht.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm" 
                        />
                        <span className="text-sm text-gray-600 truncate">{kiht.nimi}</span> 
                      </label>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0"> 
                        <button 
                          onClick={() => liigutaKihti(indeks, 'up')} 
                          disabled={indeks === 0} 
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Liiguta üles"
                        >
                          <Icon name="arrow-up" size={16} className="text-gray-500" />
                        </button>
                        <button 
                          onClick={() => liigutaKihti(indeks, 'down')} 
                          disabled={indeks === järjestatudKihiIdd.length - 1} 
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Liiguta alla"
                        >
                          <Icon name="arrow-down" size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-250px)] md:h-[calc(100vh-200px)] rounded-lg shadow-lg overflow-hidden">
        <div ref={kaardiKonteinerRef} id="mapid" className="w-full h-full z-0"></div> 
        
        <div className="absolute top-4 left-4 flex flex-col space-y-1 z-10">
          <button onClick={suumiSisse} className="bg-white p-2 rounded-md shadow hover:bg-gray-100 text-gray-700 text-lg font-bold focus:outline-none">+</button>
          <button onClick={suumiVälja} className="bg-white p-2 rounded-md shadow hover:bg-gray-100 text-gray-700 text-lg font-bold focus:outline-none">-</button>
        </div>

         <div className="absolute bottom-4 left-4 z-20"> 
            <SelectGroup
                options={linnad.map(l => l.name)} 
                selectedValue={valitudLinn.name} 
                onSelect={(linnaNimi) => {
                    const indeks = linnad.findIndex(l => l.name === linnaNimi);
                    if (indeks !== -1) {
                        määraValitudLinnaIndeks(indeks);
                    }
                }}
                containerClass="inline-block" 
            />
        </div>
        
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow w-48 z-10">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">Keskmine €/m²</h4>
          {hinnavahemikud.map(item => (
            <div key={item.range} className="flex items-center space-x-2 mb-1">
              <div className={`w-4 h-4 rounded-sm ${item.color}`}></div>
              <span className="text-xs text-gray-600">{item.range}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Kaardiandmed (nt OpenStreetMap) kuvatakse siin. Aktiivsed kihid: {järjestatudKihiIdd.filter(id => aktiivsedKihid[id]).map(id => kihiDetailideMap.get(id)?.name).join(', ') || 'Puudub'}
      </p>
    </div>
  );
};


// siia parast igasugu chartid
const Töölaud = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <JaotisePealkiri>Kinnisvara töölaud</JaotisePealkiri>
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">Töölaud on hetkel tühi.</p>
      </div>
    </div>
  );
};

// Range slider component
const RangeSlider = ({ id, label, min, max, step, value, onChange, unit, valueWidthClass = "w-16" }) => {
  const protsent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-3">
        <div className="relative w-full h-4 flex items-center"> 
            <div className="absolute left-0 right-0 h-2 bg-gray-200 rounded-full"></div> 
            <div 
                className="absolute left-0 h-2 bg-blue-600 rounded-full" 
                style={{ width: `${protsent}%` }}
            ></div>
            <input 
                type="range" 
                id={id} 
                min={min} 
                max={max} 
                step={step}
                value={value} 
                onChange={onChange}
                className="w-full h-4 appearance-none bg-transparent cursor-pointer focus:outline-none absolute top-0 left-0 z-10 
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:h-5 
                           [&::-webkit-slider-thumb]:w-5 
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-blue-600
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-sm
                           [&::-moz-range-thumb]:appearance-none
                           [&::-moz-range-thumb]:h-5 
                           [&::-moz-range-thumb]:w-5 
                           [&::-moz-range-thumb]:rounded-full
                           [&::-moz-range-thumb]:bg-blue-600
                           [&::-moz-range-thumb]:cursor-pointer
                           [&::-moz-range-thumb]:border-none 
                           [&::-moz-range-thumb]:shadow-sm"
            />
        </div>
        <span className={`text-sm text-gray-600 text-right ${valueWidthClass}`}>{value} {unit}</span>
      </div>
    </div>
  );
};

// siin leht kuhu pane pkl
const Hinnaennustus = () => {
  const kinnisvaraTüübiValikud = ['Korter', 'Maja'];
  const [kinnisvaraTüüp, määraKinnisvaraTüüp] = useState(kinnisvaraTüübiValikud[0]);
  
  const [suurus, määraSuurus] = useState(60);
  const [tube, määraTube] = useState(2);
  const [korrus, määraKorrus] = useState(3); 
  const [ehitusaasta, määraEhitusaasta] = useState(new Date().getFullYear() - 20); 
  const [krundiPindala, määraKrundiPindala] = useState(500); 
  
  const seisukorrad = ['Heas korras', 'Suurepärane', 'Rahuldav', 'Vajab renoveerimist'];
  const [seisukord, määraSeisukord] = useState(seisukorrad[0]);
  
  const [aadress, määraAadress] = useState('');
  const [ennustatudHind, määraEnnustatudHind] = useState(null);

  const handleEnnusta = (e) => {
    e.preventDefault(); 
    const praeguneAasta = new Date().getFullYear();
    const hooneVanus = praeguneAasta - ehitusaasta;

    const baasHind = 50000;
    let arvutatudHind = baasHind + (suurus * 1500) + (tube * 5000) - (hooneVanus * 300);
    if (kinnisvaraTüüp === 'Maja') {
      arvutatudHind += krundiPindala * 50; 
    }
    const juhuslikFaktor = (Math.random() - 0.5) * 10000; 
    arvutatudHind += juhuslikFaktor;
    määraEnnustatudHind(Math.max(20000, Math.round(arvutatudHind / 1000) * 1000));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <JaotisePealkiri>Hinnaennustusmudel</JaotisePealkiri> 
      <p className="text-sm text-gray-500 mb-6">Hinda kinnisvara hinda meie masinõppe mudeli abil (simulatsioon).</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KaartKomponent>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Kinnisvara detailid</h3>
          <p className="text-xs text-gray-500 mb-4">Sisesta kinnisvara detailid hinnaprognoosi saamiseks.</p>
          <form onSubmit={handleEnnusta} className="space-y-6">
            <SelectGroup
              label="Kinnisvara tüüp"
              options={kinnisvaraTüübiValikud}
              selectedValue={kinnisvaraTüüp}
              onSelect={määraKinnisvaraTüüp}
            />
            
            <RangeSlider 
              id="size"
              label="Eluruumi pindala (m²)"
              min={20} max={300} value={suurus}
              onChange={(e) => määraSuurus(Number(e.target.value))}
              unit="m²"
              valueWidthClass="w-16"
            />

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${kinnisvaraTüüp === 'Maja' ? 'max-h-40 opacity-100 pt-6' : 'max-h-0 opacity-0'}`}> 
              {kinnisvaraTüüp === 'Maja' && (
                  <RangeSlider 
                    id="plotArea"
                    label="Krundi pindala (m²)"
                    min={100} max={5000} step={50} value={krundiPindala}
                    onChange={(e) => määraKrundiPindala(Number(e.target.value))}
                    unit="m²"
                    valueWidthClass="w-20" 
                  />
              )}
            </div>
            
            <RangeSlider
              id="rooms"
              label="Tubade arv"
              min={1} max={10} value={tube}
              onChange={(e) => määraTube(Number(e.target.value))}
              unit=""
              valueWidthClass="w-12"
            />
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${kinnisvaraTüüp === 'Korter' ? 'max-h-40 opacity-100 pt-6' : 'max-h-0 opacity-0'}`}> 
              {kinnisvaraTüüp === 'Korter' && (
                  <RangeSlider
                    id="floor"
                    label="Korrus"
                    min={1} max={40} value={korrus} 
                    onChange={(e) => määraKorrus(Number(e.target.value))}
                    unit=""
                    valueWidthClass="w-12"
                  />
              )}
            </div>

            <div>
              <label htmlFor="ehitusaasta" className="block text-sm font-medium text-gray-700 mb-1">Ehitusaasta</label>
              <input 
                type="number" 
                id="ehitusaasta" 
                value={ehitusaasta} 
                onChange={(e) => määraEhitusaasta(Number(e.target.value))}
                placeholder="Nt 2005"
                min="1800" 
                max={new Date().getFullYear()} 
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
              />
            </div>
            
            {seisukorrad.length === 2 ? (
                 <PillSelector
                     label="Seisukord"
                     option1={seisukorrad[0]}
                     option2={seisukorrad[1]} 
                     selectedOption={seisukord}
                     onSelect={määraSeisukord}
                 />
            ) : (
                <SelectGroup
                    label="Seisukord"
                    options={seisukorrad}
                    selectedValue={seisukord}
                    onSelect={määraSeisukord}
                />
            )}


            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Aadress (valikuline)</label>
              <input type="text" id="address" value={aadress} onChange={(e) => määraAadress(e.target.value)} placeholder="Sisesta tänava aadress" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-md transition-colors duration-150" > Ennusta hind </button>
          </form>
        </KaartKomponent>
        <KaartKomponent className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Ennustatud hind</h3>
          <p className="text-xs text-gray-500 mb-6 text-center">Põhineb sarnaste kinnisvaraobjektide masinõppe analüüsil (simulatsioon).</p>
          {ennustatudHind ? (
            <div className="text-center">
              <Icon name="search" size={48} className="text-blue-500 mx-auto mb-4" />
              <p className="text-3xl md:text-4xl font-bold text-blue-600">€{ennustatudHind.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">See on ligikaudne väärtus.</p>
            </div>
          ) : (
            <div className="text-center">
              <Icon name="search" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hinnangu saamiseks sisesta kinnisvara detailid ja kliki "Ennusta hind".</p>
            </div>
          )}
        </KaartKomponent>
      </div>
    </div>
  );
};

// infoleht
const InfoLeht = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <JaotisePealkiri>Info</JaotisePealkiri>
      <KaartKomponent>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Rakendusest</h3>
        <p className="text-sm text-gray-600 mb-4"> Siia tuleb lühikokkuvõte mida teha saab ja how</p>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Siin placeholderid prg</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
          <li>React.js</li>
          <li></li>
          <li>Lucide React</li>
          <li>(Diagrammid)</li>
          <li>(Leaflet)</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Kontakt</h3>
      </KaartKomponent>
    </div>
  );
};
const AllikadVaade = () => {
  const accessDate = "May 9, 2025"; // vaadata kas nii viidata norm

  return (
    <div className="p-4 md:p-6">
      <JaotisePealkiri>Kasutatud Allikad</JaotisePealkiri>
      
      <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
        <p className="text-sm text-gray-700" style={{ lineHeight: '1.6' }}>
          Stadia Maps, Inc. (n.d.). <em className="italic">Stadia Maps documentation</em>. Retrieved {accessDate}, from <a href="https://docs.stadiamaps.com/?utm_source=marketing_site&utm_content=navbar" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">https://docs.stadiamaps.com/?utm_source=marketing_site&utm_content=navbar</a>
        </p>
      </div>
    </div>
  );
};

// peamine const
const App = () => {
  const [praeguneLeht, määraPraeguneLeht] = useState('map'); // see paneb peamiseks leheks mapi
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const renderdaLeht = () => {
    switch (praeguneLeht) {
      case 'map': return <Kaardivaade />;
      case 'dashboard': return <Töölaud />;
      case 'prediction': return <Hinnaennustus />;
      case 'info': return <InfoLeht />;
      case 'allikad': return <AllikadVaade />; 
      case 'apartments': return <Töölaud />; 
      case 'houses': return <Töölaud />; 
      default: return <Töölaud />; 
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Külgriba 
        praeguneLeht={praeguneLeht} 
        määraPraeguneLeht={määraPraeguneLeht} 
        kasMobiiliMenüüAvatud={mobileOpen} 
        lülitaMobiiliMenüü={toggleMobile} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4">
           <h1 className="text-lg font-bold text-blue-700">Kinnisvara</h1>
          <button onClick={toggleMobile} className="text-gray-600 hover:text-gray-800"> <Icon name="menu" size={24} /> </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderdaLeht()}
        </main>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" onClick={toggleMobile} ></div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

if (typeof feather !== 'undefined') {
  setTimeout(() => {
    feather.replace();
  }, 100);
}
