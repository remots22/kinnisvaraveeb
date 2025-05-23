import React, { useState, useEffect, useCallback } from 'react';
import { PillSelector, Valikuriba, KaartKomponent, JaotisePealkiri } from '../components/UIComponents';
import { KINNISVARA_TÜÜBID } from '../constants';
import './Mudel.css';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Mudel = () => {
  const [kinnisvaraTüüp, setKinnisvaraTüüp] = useState(KINNISVARA_TÜÜBID[0].name);
  const [ehitusaasta, setEhitusaasta] = useState('');
  const [energiaklass, setEnergiaklass] = useState('A');
  const [pindala, setPindala] = useState('');
  const [tubadeArv, setTubadeArv] = useState(1);
  const [rõduTerrass, setRõduTerrass] = useState('Ei');
  const [korruseid, setKorruseid] = useState('');
  const [korrus, setKorrus] = useState('');
  const [seisukord, setSeisukord] = useState('Heas korras');
  const [materjalKategooria, setMaterjalKategooria] = useState('Paneel');
  const [krundiPind, setKrundiPind] = useState('');
  const [suurRõdu, setSuurRõdu] = useState('Ei');
  const [ennustus, setEnnustus] = useState(null);
  const [ennustusteLaeb, setEnnustusteLaeb] = useState(false);
  const [sisendParameetrid, setSisendParameetrid] = useState(null);
  
  const [aadressOtsing, setAadressOtsing] = useState('');
  const [aadressSoovitused, setAadressSoovitused] = useState([]);
  const [valitudAadress, setValitudAadress] = useState(null);
  const [koordinaadid, setKoordinaadid] = useState(null); // siin hoitakse koordinaate
  const [laebSoovitusi, setLaebSoovitusi] = useState(false);

  const energiaklassiValikud = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seisukorraValikud = ['Uus', 'Heas korras', 'Keskmises seisukorras', 'Vajab remonti'];
  const materjalValikud = ['Paneel', 'Kivi', 'Puit', 'Betoon'];

  // muundab wgs84 koordinaadid L-EST97 formaati
  const convertWGS84ToEPSG3301 = (longitude, latitude) => {
    
    const lat0 = 58.0;  // eesti keskmine
    const lon0 = 24.0; 
    
    const a = 6378137.0;    //eesti keskmine
    const f = 1/298.257223563;
    const e2 = 2*f - f*f;
    
    const lat_0 = 57.51755393055556 * Math.PI / 180; 
    const lon_0 = 24.0 * Math.PI / 180;
    const x_0 = 500000.0;
    const y_0 = 6375000.0;
    
    const lat_rad = latitude * Math.PI / 180;
    const lon_rad = longitude * Math.PI / 180;
    const m = Math.cos(lat_rad) / Math.sqrt(1 - e2 * Math.sin(lat_rad) * Math.sin(lat_rad));
    const t = Math.tan(Math.PI/4 - lat_rad/2) / 
              Math.pow((1 - Math.sqrt(e2) * Math.sin(lat_rad)) / 
                       (1 + Math.sqrt(e2) * Math.sin(lat_rad)), Math.sqrt(e2)/2);
    
    const t_0 = Math.tan(Math.PI/4 - lat_0/2) / 
                Math.pow((1 - Math.sqrt(e2) * Math.sin(lat_0)) / 
                         (1 + Math.sqrt(e2) * Math.sin(lat_0)), Math.sqrt(e2)/2);
    
    const m_0 = Math.cos(lat_0) / Math.sqrt(1 - e2 * Math.sin(lat_0) * Math.sin(lat_0));
    
    const n = Math.sin(lat_0);
    const F = m_0 / (n * Math.pow(t_0, n));
    const rho_0 = a * F * Math.pow(t_0, n);
    const rho = a * F * Math.pow(t, n);
    
    const theta = n * (lon_rad - lon_0);
    
    const x = x_0 + rho * Math.sin(theta);
    const y = y_0 + rho_0 - rho * Math.cos(theta);
    
    return { x: Math.round(x), y: Math.round(y) };
  };

  // seee kontrollib kas on tallinnas/tartus/parnus (hiljem)
  const isPointInPolygon = (point, polygon) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // see otsib milline linn ja keskpunkt
  const determineCityFromCoords = async (coords) => {
    console.log('Kontrollin koordinaate:', coords.longitude, coords.latitude);
    
    const basePath = process.env.PUBLIC_URL;
    const cityFiles = [
      { name: "Tallinn", file: `${basePath}/mudel/tallinn3.geojson`, center: [542286.66, 6589078.51] },
      { name: "Tartu", file: `${basePath}/mudel/tartu3.geojson`, center: [659225.97, 6474307.31] },
      { name: "Pärnu", file: `${basePath}/mudel/parnu3.geojson`, center: [529321.62, 6471686.43] }
    ];
    
    for (const city of cityFiles) {
      try {
        const response = await fetch(city.file);
        if (!response.ok) {
          console.error(`Ei õnnestunud laadida ${city.file}: ${response.status} ${response.statusText}`);
          continue;
        }
        const geojson = await response.json();
        
        // kontrollib iga feature labi
        for (const feature of geojson.features) {
          if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0]; 
            if (isPointInPolygon([coords.longitude, coords.latitude], coordinates)) {
              console.log(`Punkt leitud linnas ${city.name}`);
              return { 
                name: city.name, 
                center: city.center 
              };
            }
          } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
              const coordinates = polygon[0];
              if (isPointInPolygon([coords.longitude, coords.latitude], coordinates)) {
                console.log(`Punkt leitud linnas ${city.name}`);
                return { 
                  name: city.name, 
                  center: city.center 
                };
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Could not load ${city.name} boundaries:`, error);
      }
    }
    
    return null;
  };

  // see otsib mitu mida 500m raadiuse sees
  const calculateNearbyAmenities = async (coords) => {
    const basePath = process.env.PUBLIC_URL;
    const amenityFiles = [
      { type: 'kohvikud', file: `${basePath}/mudel/tallinntartupärnukohvikud.geojson` },
      { type: 'restod', file: `${basePath}/mudel/tallinntartupärnurestod.geojson` },
      { type: 'poed', file: `${basePath}/mudel/tallinntartupärnupoed.geojson` }
    ];

    const counts = { kohvikud_500m: 0, restod_500m: 0, poed_500m: 0 };
    const radius = 500;

    for (const amenity of amenityFiles) {
      try {
        const response = await fetch(amenity.file);
        if (!response.ok) continue;
        
        const geojson = await response.json();
        
        for (const feature of geojson.features) {
          let amenityCoords;
          
          if (feature.geometry.type === 'Point') {
            amenityCoords = feature.geometry.coordinates;
          } else if (feature.geometry.type === 'Polygon') {
            // kasutab keskkohta
            const polygon = feature.geometry.coordinates[0];
            const centroid = polygon.reduce((acc, coord) => {
              acc[0] += coord[0];
              acc[1] += coord[1];
              return acc;
            }, [0, 0]);
            amenityCoords = [centroid[0] / polygon.length, centroid[1] / polygon.length];
          } else {
            continue;
          }

          const amenityEpsg3301 = convertWGS84ToEPSG3301(amenityCoords[0], amenityCoords[1]);
          const distance = Math.sqrt(
            Math.pow(coords.x - amenityEpsg3301.x, 2) + 
            Math.pow(coords.y - amenityEpsg3301.y, 2)
          );

          if (distance <= radius) {
            counts[`${amenity.type}_500m`]++;
          }
        }
      } catch (error) {
        console.warn(`Could not load ${amenity.type} data:`, error);
      }
    }

    console.log('Lähedased teenused:', counts);
    return counts;
  };

  const calculateModelFeatures = async (inputData) => {
    const { ehitusaasta, pindala, tubadeArv, koordinaadid, kinnisvaraTüüp, krundiPind, suurRõdu } = inputData;
    const currentYear = new Date().getFullYear();
    const vanus = ehitusaasta ? currentYear - parseInt(ehitusaasta) : 30;
    
    const epsg3301Coords = convertWGS84ToEPSG3301(koordinaadid.longitude, koordinaadid.latitude);
    
    const coordsForCheck = {
      longitude: koordinaadid.longitude,
      latitude: koordinaadid.latitude,
      x: epsg3301Coords.x,
      y: epsg3301Coords.y
    };
    const cityInfo = await determineCityFromCoords(coordsForCheck);
    
    if (!cityInfo) {
      throw new Error(`Valitud asukoht pole Tallinnas, Tartus ega Pärnus. Mudel toetab ainult neid kolme linna. Koordinaadid: ${epsg3301Coords.x}, ${epsg3301Coords.y}`);
    }
    
    const [centerX, centerY] = cityInfo.center;
    const cityName = cityInfo.name;
    
    const distance_from_center = Math.sqrt(Math.pow(epsg3301Coords.x - centerX, 2) + Math.pow(epsg3301Coords.y - centerY, 2));
    console.log(`Kauguse arvutus: Punkt (${epsg3301Coords.x}, ${epsg3301Coords.y}) kuni keskus (${centerX}, ${centerY}) = ${distance_from_center.toFixed(0)}m`);
    
    const amenities = await calculateNearbyAmenities(epsg3301Coords);
    

    const area_per_room = pindala ? parseFloat(pindala) / tubadeArv : 25;
    const floor_ratio = korrus && korruseid ? parseFloat(korrus) / parseFloat(korruseid) : 0.5;
    const is_ground_floor = korrus === '1' || korrus === 1;
    const is_top_floor = korrus && korruseid && parseInt(korrus) === parseInt(korruseid);
    const is_middle_floor = !is_ground_floor && !is_top_floor;
    
    return {
      ehitusaasta_orig: ehitusaasta ? parseFloat(ehitusaasta) : 1990,
      vanus: vanus,
      pindala_numeric: pindala ? parseFloat(pindala) : 50,
      tube: tubadeArv,
      korrus: korrus ? parseFloat(korrus) : 2,
      korruseid: korruseid ? parseFloat(korruseid) : 5,
      distance_from_center: distance_from_center,
      x: epsg3301Coords.x,
      y: epsg3301Coords.y,
      city: cityName,
      area_per_room: area_per_room,
      floor_ratio: floor_ratio,
      is_ground_floor: is_ground_floor ? 1 : 0,
      is_top_floor: is_top_floor ? 1 : 0,
      is_middle_floor: is_middle_floor ? 1 : 0,
      balcony_terrace_presence: rõduTerrass === 'Jah' ? 1 : 0,
      'Suur rõdu või terrass': suurRõdu === 'Jah' ? 1 : 0,
      krundi_pindala_numeric: kinnisvaraTüüp === 'Maja' && krundiPind ? parseFloat(krundiPind) : 0,
      kohvikud_500m: amenities.kohvikud_500m,
      restod_500m: amenities.restod_500m,
      poed_500m: amenities.poed_500m,
      energiaklass: energiaklass,
      seisukord_kategooria: seisukord,
      materjal_kategooria: materjalKategooria,
      objekti_tüüp: kinnisvaraTüüp
    };
  };


  // laeb tegeliku XGBoost mudeli sisse
  const [xgbModel, setXgbModel] = useState(null);
  const [featureNames, setFeatureNames] = useState(null);

  useEffect(() => {
    const loadXGBoostModel = async () => {
      try {
        const basePath = process.env.PUBLIC_URL;
        console.log('Laadin tegelikku XGBoost mudelit...');
        
        // Laeb mudeli JSON faili
        const modelResponse = await fetch(`${basePath}/mudel/xgb_rf_ridge/model.json`);
        const modelData = await modelResponse.json();
        
        // Laeb feature nimesid CSV failist
        const featuresResponse = await fetch(`${basePath}/mudel/xgb_rf_ridge/enhanced_feature_importance.csv`);
        const csvText = await featuresResponse.text();
        const lines = csvText.split('\n').slice(1);
        const features = [];
        
        lines.forEach(line => {
          if (line.trim()) {
            const [feature] = line.split(',');
            features.push(feature.trim());
          }
        });
        
        setXgbModel(modelData);
        setFeatureNames(features);
        console.log('XGBoost mudel laetud, feature count:', features.length);
        console.log('Mudeli info:', {
          trees: modelData.learner.gradient_booster.model.gbtree_model_param.num_trees,
          baseScore: modelData.learner.learner_model_param.base_score
        });
      } catch (error) {
        console.error('Viga XGBoost mudeli laadimisel:', error);
      }
    };

    loadXGBoostModel();
  }, []);

  const predictWithXGBoost = (featureVector, model) => {
    try {
      const trees = model.learner.gradient_booster.model.trees;
      const baseScore = parseFloat(model.learner.learner_model_param.base_score);
      let prediction = baseScore;
      
      // koigi treede predictionid liidetakse
      for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
        const tree = trees[treeIndex];
        let nodeIndex = 0;
        
        while (tree.left_children[nodeIndex] !== -1) {
          const splitFeature = tree.split_indices[nodeIndex];
          const splitValue = tree.split_conditions[nodeIndex];
          const featureValue = featureVector[splitFeature] || 0;
          
          if (featureValue < splitValue) {
            nodeIndex = tree.left_children[nodeIndex];
          } else {
            nodeIndex = tree.right_children[nodeIndex];
          }
        }
        
        prediction += tree.base_weights[nodeIndex];
      }
      
      return prediction;
    } catch (error) {
      console.error('Viga XGBoost ennustuses:', error);
      throw error;
    }
  };

  // vaja leida
  const transformToFeatureVector = (features) => {
    if (!featureNames) {
      throw new Error('Feature nimed ei ole veel laetud');
    }
    
    // tekitab feature vektor 0
    const featureVector = new Array(featureNames.length).fill(0);
    const featureMap = {
      'pindala_numeric': features.pindala_numeric,
      'tube': features.tube,
      'korrus': features.korrus,
      'korruseid': features.korruseid,
      'vanus': features.vanus,
      'ehitusaasta_orig': features.ehitusaasta_orig,
      'distance_from_center': features.distance_from_center,
      'x': features.x,
      'y': features.y,
      'area_per_room': features.area_per_room,
      'floor_ratio': features.floor_ratio,
      'is_ground_floor': features.is_ground_floor,
      'is_top_floor': features.is_top_floor,
      'is_middle_floor': features.is_middle_floor,
      'balcony_terrace_presence': features.balcony_terrace_presence,
      'Suur rõdu või terrass': features['Suur rõdu või terrass'],
      'krundi_pindala_numeric': features.krundi_pindala_numeric,
      'kohvikud_500m': features.kohvikud_500m,
      'restod_500m': features.restod_500m,
      'poed_500m': features.poed_500m,
      [`omavalitsus_kategooria_${features.city}`]: 1,
      [`energiaklass_${features.energiaklass}`]: 1,
      [`seisukord_kategooria_${features.seisukord_kategooria}`]: 1,
      [`materjal_kategooria_${features.materjal_kategooria}`]: 1,
      [`objekti_tüüp_${features.objekti_tüüp}`]: 1,
      'age_category_Very_New': features.vanus < 5 ? 1 : 0,
      'age_category_New': features.vanus >= 5 && features.vanus < 15 ? 1 : 0,
      'age_category_Medium': features.vanus >= 15 && features.vanus < 30 ? 1 : 0,
      'age_category_Old': features.vanus >= 30 ? 1 : 0
    };
    for (const [featureName, value] of Object.entries(featureMap)) {
      const index = featureNames.indexOf(featureName);
      if (index !== -1) {
        featureVector[index] = value;
      }
    }
    
    return featureVector;
  };

  const predictPrice = async (features) => {
    if (!xgbModel || !featureNames) {
      throw new Error('XGBoost mudel ei ole veel laetud');
    }

    try {
      console.log('Kasutan tegelikku XGBoost mudelit ennustamiseks...');
      const featureVector = transformToFeatureVector(features);
      const predictedPricePerM2 = Math.round(Math.max(1000, predictWithXGBoost(featureVector, xgbModel)));
      const area = features.pindala_numeric;
      const totalPrice = Math.round(predictedPricePerM2 * area / 1000) * 1000;
      
      const percentile = Math.min(95, Math.max(5, 
        predictedPricePerM2 < 2000 ? 25 :
        predictedPricePerM2 < 2500 ? 40 :
        predictedPricePerM2 < 3000 ? 60 :
        predictedPricePerM2 < 4000 ? 80 : 90
      ));
      
      console.log(`XGBoost ennustus: ${predictedPricePerM2} €/m²`);
      console.log('Kasutatud features:', Object.keys(features).length);

      return {
        pricePerM2: predictedPricePerM2,
        totalPrice: totalPrice,
        percentile: percentile,
        isRealModel: true
      };
    } catch (error) {
      console.error('Viga XGBoost ennustuse tegemisel:', error);
      throw error;
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const fetchAadressSoovitused = async (otsing) => {
    if (otsing.length < 3 || !MAPBOX_ACCESS_TOKEN) {
      setAadressSoovitused([]);
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn('mapbox token puudub/muutunud');
      }
      return;
    }
    setLaebSoovitusi(true);
    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        country: 'EE',
        limit: 5,
        types: 'address,postcode,locality,neighborhood,place',
        autocomplete: true,
      });
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(otsing)}.json?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mapbox API viga: ${response.statusText} - ${errorData.message || 'Tundmatu viga'}`);
      }
      const data = await response.json();
      setAadressSoovitused(data.features || []);
    } catch (error) {
      console.error('Viga aadressi soovituste näitamisel:', error);
      setAadressSoovitused([]);
    } finally {
      setLaebSoovitusi(false);
    }
  };

  const debouncedFetchAadressSoovitused = useCallback(debounce(fetchAadressSoovitused, 300), []);

  useEffect(() => {
    debouncedFetchAadressSoovitused(aadressOtsing);
  }, [aadressOtsing, debouncedFetchAadressSoovitused]);

  const handleAadressValik = (feature) => {
    setValitudAadress(feature);
    setAadressOtsing(feature.place_name);
    setAadressSoovitused([]);
    
    if (feature.center && feature.center.length === 2) {
      // tagastab koordinaadid
      setKoordinaadid({ longitude: feature.center[0], latitude: feature.center[1] });
    } else {
       console.warn('Koordinaate ei leitud:', feature);
       setKoordinaadid(null);
    }
  };

  const handleTubadeArvMuutus = (muutus) => {
    setTubadeArv(prev => {
      const uusArv = prev + muutus;
      return uusArv >= 1 ? uusArv : 1;
    });
  };
  
  const handleTubadeArvSisestus = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1) {
      setTubadeArv(v);
    } else if (e.target.value === '') {
      setTubadeArv(1); 
    }
  };

  const handleSubmit = async () => {
    if (!koordinaadid || !pindala || !ehitusaasta) {
      alert('Palun täitke kõik kohustuslikud väljad: aadress, pindala ja ehitusaasta');
      return;
    }

    if (!xgbModel || !featureNames) {
      alert('XGBoost mudel laadib veel. Palun oodake hetk.');
      return;
    }


    setEnnustusteLaeb(true);
    setEnnustus(null);
    setSisendParameetrid(null);

    try {
      const inputData = {
        kinnisvaraTüüp,
        ehitusaasta,
        energiaklass,
        pindala,
        tubadeArv,
        rõduTerrass,
        koordinaadid,
        korrus,
        korruseid,
        seisukord,
        materjalKategooria,
        krundiPind,
        suurRõdu
      };

      const features = await calculateModelFeatures(inputData);
      const prediction = await predictPrice(features);

      setSisendParameetrid(features);
      setEnnustus(prediction);
    } catch (error) {
      console.error('Viga ennustuse tegemisel:', error);
      alert('Viga ennustuse tegemisel. Palun proovige uuesti.');
    } finally {
      setEnnustusteLaeb(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen mudel-container">
      <JaotisePealkiri>Ennustusmudeli seadistamine</JaotisePealkiri>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <KaartKomponent className="space-y-4">
        <PillSelector
          silt="Kinnisvara tüüp"
          valik1={KINNISVARA_TÜÜBID[0].name}
          valik2={KINNISVARA_TÜÜBID[1].name}
          valitudValik={kinnisvaraTüüp}
          onVali={setKinnisvaraTüüp}
        />

        <div>
          <label htmlFor="ehitusaasta" className="block text-sm font-medium text-gray-700 mb-1">Ehitusaasta</label>
          <input
            type="number"
            id="ehitusaasta"
            value={ehitusaasta}
            onChange={(e) => setEhitusaasta(e.target.value)}
            placeholder="Nt 2005"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Valikuriba
          silt="Energiaklass"
          valikud={energiaklassiValikud}
          valitudVäärtus={energiaklass}
          onVali={setEnergiaklass}
        />

        <div>
          <label htmlFor="pindala" className="block text-sm font-medium text-gray-700 mb-1">Pindala (m²) *</label>
          <input
            type="number"
            id="pindala"
            value={pindala}
            onChange={(e) => setPindala(e.target.value)}
            placeholder="Nt 75"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {kinnisvaraTüüp === 'Maja' && (
          <div>
            <label htmlFor="krundiPind" className="block text-sm font-medium text-gray-700 mb-1">Krundi pind (m²)</label>
            <input
              type="number"
              id="krundiPind"
              value={krundiPind}
              onChange={(e) => setKrundiPind(e.target.value)}
              placeholder="Nt 800"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <Valikuriba
          silt="Seisukord"
          valikud={seisukorraValikud}
          valitudVäärtus={seisukord}
          onVali={setSeisukord}
        />

        <Valikuriba
          silt="Materjal"
          valikud={materjalValikud}
          valitudVäärtus={materjalKategooria}
          onVali={setMaterjalKategooria}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="korrus" className="block text-sm font-medium text-gray-700 mb-1">Korrus</label>
            <input
              type="number"
              id="korrus"
              value={korrus}
              onChange={(e) => setKorrus(e.target.value)}
              placeholder="Nt 3"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="korruseid" className="block text-sm font-medium text-gray-700 mb-1">Korruseid kokku</label>
            <input
              type="number"
              id="korruseid"
              value={korruseid}
              onChange={(e) => setKorruseid(e.target.value)}
              placeholder="Nt 5"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="tubadeArv" className="block text-sm font-medium text-gray-700 mb-1">Tubade arv</label>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={() => handleTubadeArvMuutus(-1)} 
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
            >
              -
            </button>
            <input
              type="number"
              id="tubadeArv"
              value={tubadeArv}
              onChange={handleTubadeArvSisestus}
              min="1"
              className="w-16 text-center p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="button" 
              onClick={() => handleTubadeArvMuutus(1)} 
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
            >
              +
            </button>
          </div>
        </div>

        <PillSelector
          silt="Rõdu/Terrass"
          valik1="Jah"
          valik2="Ei"
          valitudValik={rõduTerrass}
          onVali={setRõduTerrass}
        />

        {rõduTerrass === 'Jah' && (
          <PillSelector
            silt="Suur rõdu või terrass"
            valik1="Jah"
            valik2="Ei"
            valitudValik={suurRõdu}
            onVali={setSuurRõdu}
          />
        )}

        <div className="relative">
          <label htmlFor="aadress" className="block text-sm font-medium text-gray-700 mb-1">Aadress *</label>
          <input
            type="text"
            id="aadress"
            value={aadressOtsing}
            onChange={(e) => setAadressOtsing(e.target.value)}
            placeholder="Otsi aadressi (nt Pae 1, Tallinn)"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />
          {laebSoovitusi && <div className="absolute right-2 top-9 text-xs text-gray-500">Laen...</div>}
          {aadressSoovitused.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
              {aadressSoovitused.map((feature) => (
                <li
                  key={feature.id}
                  onClick={() => handleAadressValik(feature)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {feature.place_name}
                </li>
              ))}
            </ul>
          )}
          {valitudAadress && koordinaadid && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm">
              <p className="font-semibold">Valitud aadress: {valitudAadress.place_name}</p>
              <p>Koordinaadid: {koordinaadid.longitude.toFixed(3)}, {koordinaadid.latitude.toFixed(3)}</p>
            </div>
          )}
          {valitudAadress && !koordinaadid && aadressOtsing && (
             <div className="mt-2 p-2 bg-yellow-100 rounded-md text-sm">
               <p className="font-semibold">Koordinaate ei leitud valitud aadressile.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={ennustusteLaeb || !xgbModel || !featureNames}
          className={`w-full font-semibold py-2.5 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out ${
            ennustusteLaeb || !xgbModel || !featureNames
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {ennustusteLaeb ? 'Arvutan...' : 
           !xgbModel || !featureNames ? 'Laadin XGBoost mudelit...' : 
           'Arvuta hind'}
        </button>
      </KaartKomponent>
        </div>

        {(ennustus || sisendParameetrid) && (
          <div className="flex-1">
            <KaartKomponent className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ennustuse tulemused</h3>
              
              {ennustus && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Hinna ennustus</h4>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-blue-800">
                        {ennustus.pricePerM2.toLocaleString()} €/m²
                      </p>
                      <p className="text-xl text-blue-700">
                        Koguhind: {ennustus.totalPrice.toLocaleString()} €
                      </p>
                      <p className="text-sm text-gray-600">
                        {ennustus.percentile > 75 ? 'Kallim kui keskmine' : 
                         ennustus.percentile > 50 ? 'Keskmisest kallim' : 
                         ennustus.percentile > 25 ? 'Keskmisest odavam' : 'Odavam kui keskmine'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {sisendParameetrid && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Mudeli sisendparameetrid</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Pindala:</span> {sisendParameetrid.pindala_numeric} m²</div>
                    <div><span className="font-medium">Tubade arv:</span> {sisendParameetrid.tube}</div>
                    <div><span className="font-medium">Vanus:</span> {sisendParameetrid.vanus} aastat</div>
                    <div><span className="font-medium">Korrus:</span> {sisendParameetrid.korrus}/{sisendParameetrid.korruseid}</div>
                    <div><span className="font-medium">Linn:</span> {sisendParameetrid.city}</div>
                    <div><span className="font-medium">Kohvikud 500m:</span> {sisendParameetrid.kohvikud_500m}</div>
                    <div><span className="font-medium">Restoranid 500m:</span> {sisendParameetrid.restod_500m}</div>
                    <div><span className="font-medium">Poed 500m:</span> {sisendParameetrid.poed_500m}</div>
                    <div><span className="font-medium">Energiaklass:</span> {sisendParameetrid.energiaklass}</div>
                    <div><span className="font-medium">Seisukord:</span> {sisendParameetrid.seisukord_kategooria}</div>
                    <div><span className="font-medium">Materjal:</span> {sisendParameetrid.materjal_kategooria}</div>
                    <div><span className="font-medium">Rõdu/terrass:</span> {sisendParameetrid.balcony_terrace_presence ? 'Jah' : 'Ei'}</div>
                    {sisendParameetrid['Suur rõdu või terrass'] && (
                      <div><span className="font-medium">Suur rõdu/terrass:</span> Jah</div>
                    )}
                    {sisendParameetrid.objekti_tüüp === 'Maja' && sisendParameetrid.krundi_pindala_numeric > 0 && (
                      <div><span className="font-medium">Krundi pind:</span> {sisendParameetrid.krundi_pindala_numeric} m²</div>
                    )}
                    <div><span className="font-medium">m²/tuba:</span> {sisendParameetrid.area_per_room.toFixed(1)}</div>
                    <div><span className="font-medium">Korrusesuhe:</span> {sisendParameetrid.floor_ratio.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </KaartKomponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mudel;