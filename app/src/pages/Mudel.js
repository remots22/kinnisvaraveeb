import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PillSelector, Valikuriba } from '../components/UIComponents';
import { KINNISVARA_TÜÜBID } from '../constants';
import './Mudel.css';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Mudel = () => {
  const [kinnisvaraTüüp, setKinnisvaraTüüp] = useState(KINNISVARA_TÜÜBID[0].name);
  const [ehitusaasta, setEhitusaasta] = useState('');
  const [energiaklass, setEnergiaklass] = useState('D');
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
  const isSelectingAddress = useRef(false);

  const energiaklassiValikud = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seisukorraValikud = ['Uus', 'Heas korras', 'Keskmises seisukorras', 'Vajab remonti'];
  const materjalValikud = ['Paneel', 'Kivi', 'Puit'];

  const convertWGS84ToEPSG3301Core = (longitude, latitude) => {
    const a = 6378137.0;    
    const f = 1/298.257223563;
    const e2 = 2*f - f*f;
    
    const lat_0 = 57.51755393055556 * Math.PI / 180; 
    const lon_0 = 24.0 * Math.PI / 180;
    const x_0 = 500000.0;
    const y_0 = 6375000.0;
    
    const lat_rad = latitude * Math.PI / 180;
    const lon_rad = longitude * Math.PI / 180;
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

  // muundab wgs84 koordinaadid L-EST97 formaati 
  const convertWGS84ToEPSG3301 = (longitude, latitude) => {
    const result = convertWGS84ToEPSG3301Core(longitude, latitude);
    return result;
  };

  const convertWGS84ToEPSG3301Silent = convertWGS84ToEPSG3301Core;

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

  // see otsib milline linn, keskpunkt ja asum
  const determineCityAndDistrictFromCoords = async (coords) => {
    const basePath = process.env.PUBLIC_URL;
    const cityFiles = [
      { 
        name: "Tallinn", 
        file: `${basePath}/mudel/tallinn3.geojson`, 
        center: [542286.66, 6589078.51],
        districtFile: `${basePath}/geoinfo/tln_asumid.geojson` 
      },
      { 
        name: "Tartu", 
        file: `${basePath}/mudel/tartu3.geojson`, 
        center: [659081.55, 6474284.18],
        districtFile: `${basePath}/geoinfo/trt_asumid.geojson` 
      },
      { 
        name: "Pärnu", 
        file: `${basePath}/mudel/parnu3.geojson`, 
        center: [529128.72, 6471834.74],
        districtFile: `${basePath}/geoinfo/prn_asumid.geojson` 
      }
    ];
    
    for (const city of cityFiles) {
      try {
        const response = await fetch(city.file);
        if (!response.ok) {
          continue;
        }
        const geojson = await response.json();
        

        // kontrollib iga feature labi
        let cityFound = false;

        const pointToCheck = [coords.longitude, coords.latitude]; //wgs84
      
        for (const feature of geojson.features) {
          if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0]; 
            if (isPointInPolygon(pointToCheck, coordinates)) {
              cityFound = true;
              break;
            }
          } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
              const coordinates = polygon[0];
              if (isPointInPolygon(pointToCheck, coordinates)) {
                cityFound = true;
                break;
              }
            }
            if (cityFound) break;
          }
        }
        
        // hinnatsoonide leftover - vb peaks ara votma
        if (!cityFound && city.name === 'Tallinn' && coords.longitude > 24.5 && coords.longitude < 25.0 && coords.latitude > 59.3 && coords.latitude < 59.6) {
          cityFound = true;
        } else if (!cityFound && city.name === 'Tartu' && coords.longitude > 26.6 && coords.longitude < 26.8 && coords.latitude > 58.3 && coords.latitude < 58.45) {
          cityFound = true;
        } else if (!cityFound && city.name === 'Pärnu' && coords.longitude > 24.4 && coords.longitude < 24.6 && coords.latitude > 58.3 && coords.latitude < 58.45) {
          cityFound = true;
        }
        
        if (cityFound) {
          // nüüd otsib asumi
          let district = null;
          try {
            const districtResponse = await fetch(city.districtFile);
            if (districtResponse.ok) {
              const districtGeojson = await districtResponse.json();
              
              for (const feature of districtGeojson.features) {
                if (feature.geometry.type === 'Polygon') {
                  const coordinates = feature.geometry.coordinates[0];
                  if (isPointInPolygon(pointToCheck, coordinates)) {
                    district = feature.properties.asumi_nimi || feature.properties.NIMI || feature.properties.nimi || feature.properties.name;
                    break;
                  }
                } else if (feature.geometry.type === 'MultiPolygon') {
                  for (const polygon of feature.geometry.coordinates) {
                    const coordinates = polygon[0];
                    if (isPointInPolygon(pointToCheck, coordinates)) {
                      district = feature.properties.asumi_nimi || feature.properties.NIMI || feature.properties.nimi || feature.properties.name;
                      break;
                    }
                  }
                  if (district) break;
                }
              }
              if (!district) {
              }
            }
          } catch (error) {
          }
          
          const result = { 
            name: city.name, 
            center: city.center,
            district: district
          };
          return result;
        } else {
        }
      } catch (error) {
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

    // cache -kas tootab?
    const coordCache = new Map();

    for (const amenity of amenityFiles) {
      try {
        const response = await fetch(amenity.file);
        if (!response.ok) {
          continue;
        }
        
        const geojson = await response.json();
        
        let nearbyCount = 0;
        let conversions = 0;
        
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


          const cacheKey = `${amenityCoords[0]},${amenityCoords[1]}`;
          let amenityEpsg3301;
          
          if (coordCache.has(cacheKey)) {
            amenityEpsg3301 = coordCache.get(cacheKey);
          } else {
            amenityEpsg3301 = convertWGS84ToEPSG3301Silent(amenityCoords[0], amenityCoords[1]);
            coordCache.set(cacheKey, amenityEpsg3301);
            conversions++;
          }
          
          const distance = Math.sqrt(
            Math.pow(coords.x - amenityEpsg3301.x, 2) + 
            Math.pow(coords.y - amenityEpsg3301.y, 2)
          );

          if (distance <= radius) {
            counts[`${amenity.type}_500m`]++;
            nearbyCount++;
          }
        }
      } catch (error) {
      }
    }

    return counts;
  };

  // see otsib kas miljooalade lahedal - tuleb kontrollida kas kui nt on 100 on ka 250 ja 500m - ei tohiks olla
  const calculateMiljooalaProximity = async (epsg3301Coords, cityName) => {
    const result = {
      is_miljooala: 0,
      near_miljooala_100m: 0,
      near_miljooala_250m: 0,
      near_miljooala_500m: 0
    };

    // miljooalade rest
    const miljooalaServices = {
      'Tallinn': {
        url: 'https://gis.tallinn.ee/arcgis/rest/services/milj88alad/MapServer/3/query',
        where: "tyyp_id=2" // kehtiv miljooala tln
      },
      'Tartu': {
        url: 'https://gis.tartulv.ee/arcgis/rest/services/Planeeringud/Miljöö/MapServer/13/query',
        where: "1=1" 
      },
      'Pärnu': {
        url: 'https://services3.arcgis.com/FwX2qF9JecNSRnwr/ArcGIS/rest/services/kehtiv_miljööväärtuslik_ala/FeatureServer/0/query',
        where: "1=1" 
      }
    };

    const service = miljooalaServices[cityName];
    
    if (!service) {
      return result;
    }

    try {
      const params = new URLSearchParams({
        where: service.where,
        geometry: JSON.stringify({
          x: epsg3301Coords.x,
          y: epsg3301Coords.y,
          spatialReference: { wkid: 3301 }
        }),
        geometryType: 'esriGeometryPoint',
        spatialRel: 'esriSpatialRelIntersects',
        returnGeometry: 'false',
        returnCountOnly: 'true',
        f: 'json'
      });

      const insideResponse = await fetch(`${service.url}?${params.toString()}`);
      const insideData = await insideResponse.json();
      
      if (insideData.count > 0) {
        result.is_miljooala = 1;
        return result;
      }

      // buffers seesama 100m 250m 500m
      const buffers = [100, 250, 500]; // meters
      
      for (const buffer of buffers) {
        const bufferParams = new URLSearchParams({
          where: service.where,
          geometry: JSON.stringify({
            x: epsg3301Coords.x,
            y: epsg3301Coords.y,
            spatialReference: { wkid: 3301 }
          }),
          geometryType: 'esriGeometryPoint',
          spatialRel: 'esriSpatialRelIntersects',
          distance: buffer,
          units: 'esriSRUnit_Meter',
          returnGeometry: 'false',
          returnCountOnly: 'true',
          f: 'json'
        });

        const bufferResponse = await fetch(`${service.url}?${bufferParams.toString()}`);
        const bufferData = await bufferResponse.json();
        
        if (bufferData.count > 0) {
          if (buffer === 100) result.near_miljooala_100m = 1;
          if (buffer === 250) result.near_miljooala_250m = 1;
          if (buffer === 500) result.near_miljooala_500m = 1;
        }
      }

    } catch (error) {
    }

    return result;
  };


  const getArchitecturalEra = (year) => {
    if (year < 1562) return '1000-1561';
    if (year < 1710) return '1562-1710';
    if (year < 1880) return '1710-1879';
    if (year < 1920) return '1880–1919';
    if (year < 1945) return '1920–1944';
    if (year < 1958) return '1945–1957';
    if (year < 1973) return '1958–1972';
    if (year < 1992) return '1973–1991';
    if (year < 2001) return '1991-2000';
    if (year < 2005) return '2001-2004';
    if (year < 2009) return '2005-2008';
    if (year < 2015) return '2009-2014';
    if (year < 2021) return '2015-2020';
    if (year < 2026) return '2021-2025';
    return '2025+';
  };

  const calculateModelFeatures = async (inputData) => {
    const { ehitusaasta, pindala, tubadeArv, koordinaadid, kinnisvaraTüüp, krundiPind, suurRõdu } = inputData;
    const currentYear = new Date().getFullYear();
    const vanus = currentYear - parseInt(ehitusaasta);
    
    const epsg3301Coords = convertWGS84ToEPSG3301(koordinaadid.longitude, koordinaadid.latitude);
    
    const coordsForCheck = {
      longitude: koordinaadid.longitude,
      latitude: koordinaadid.latitude,
      x: epsg3301Coords.x,
      y: epsg3301Coords.y
    };
    const cityInfo = await determineCityAndDistrictFromCoords(coordsForCheck);
    
    if (!cityInfo) {
      throw new Error(`Valitud asukoht pole Tallinnas, Tartus ega Pärnus. Mudel toetab ainult neid kolme linna. Koordinaadid: ${epsg3301Coords.x}, ${epsg3301Coords.y}`);
    }
    
    const [centerX, centerY] = cityInfo.center;
    const cityName = cityInfo.name;
    const district = cityInfo.district;
    
    const distance_from_center = Math.sqrt(Math.pow(epsg3301Coords.x - centerX, 2) + Math.pow(epsg3301Coords.y - centerY, 2));
    
    const amenities = await calculateNearbyAmenities(epsg3301Coords);
    
    // miljooalade laheduse arvutamine
    const miljooala = await calculateMiljooalaProximity(epsg3301Coords, cityName);

    const area_per_room = pindala ? parseFloat(pindala) / tubadeArv : 25;
    const floor_ratio = korrus && korruseid ? parseFloat(korrus) / parseFloat(korruseid) : 0.5;
    const is_ground_floor = korrus === '1' || korrus === 1;
    const is_top_floor = korrus && korruseid && parseInt(korrus) === parseInt(korruseid);
    const is_middle_floor = !is_ground_floor && !is_top_floor;
    
    const buildYear = parseFloat(ehitusaasta);
    const architecturalEra = getArchitecturalEra(buildYear);
    
    const features = {
      ehitusaasta_orig: buildYear,
      vanus: vanus,
      pindala_numeric: pindala ? parseFloat(pindala) : 50,
      tube: tubadeArv,
      korrus: korrus ? parseFloat(korrus) : 2,
      korruseid: korruseid ? parseFloat(korruseid) : 5,
      distance_from_center: distance_from_center,
      x: epsg3301Coords.x,
      y: epsg3301Coords.y,
      city: cityName,
      district: district,
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
      objekti_tüüp: kinnisvaraTüüp,
      is_miljooala: miljooala.is_miljooala,
      near_miljooala_100m: miljooala.near_miljooala_100m,
      near_miljooala_250m: miljooala.near_miljooala_250m,
      near_miljooala_500m: miljooala.near_miljooala_500m,
      architectural_era: architecturalEra
    };
    
    return features;
  };



  const predictPrice = async (features) => {
    const API_URL = 'https://remots-kinnisvaram.hf.space/predict';

    try {
      const requestData = {
        pindala: features.pindala_numeric,
        tube: features.tube,
        korrus: parseInt(features.korrus) || 1,
        korruste_arv: parseInt(features.korruseid) || 5,
        ehitusaasta: parseInt(features.ehitusaasta_orig),
        x: features.x,
        y: features.y,
        seisukord: features.seisukord_kategooria || 'Heas korras',
        energiaklass: features.energiaklass || null,
        ehitusmaterjal: features.materjal_kategooria === 'Paneel' ? 'Paneelmaja' : 
                        features.materjal_kategooria === 'Kivi' ? 'Kivimaja' : 
                        features.materjal_kategooria === 'Puit' ? 'Puitmaja' : null,
        rodu: features.balcony_terrace_presence === 1,
        suur_rodu: features['Suur rõdu või terrass'] === 1
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API viga: ${response.status}`);
      }
      
      const data = await response.json();
      
      const predictedPricePerM2 = Math.round(data.price_per_sqm);
      const totalPrice = data.total_price;
      
      return {
        pricePerM2: predictedPricePerM2,
        totalPrice: totalPrice,
        isRealModel: true,
        confidenceRange: data.confidence_range,
        neighborhoodAvg: data.neighborhood_avg
      };
    } catch (error) {
      throw new Error(`Ennustuse viga: ${error.message}`);
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
    if (otsing.length < 3 || !MAPBOX_ACCESS_TOKEN || isSelectingAddress.current) {
      setAadressSoovitused([]);
      if (!MAPBOX_ACCESS_TOKEN) {
      }
      return;
    }
    setLaebSoovitusi(true);
    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        country: 'EE',
        limit: 10, 
        types: 'address,postcode,locality,neighborhood,place',
        autocomplete: true,
      });
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(otsing)}.json?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mapbox API viga: ${response.statusText} - ${errorData.message || 'Tundmatu viga'}`);
      }
      const data = await response.json();
      
      const supportedCities = ['Tallinn', 'Tartu', 'Pärnu'];
      const filteredFeatures = (data.features || []).filter(feature => {
        const placeName = feature.place_name || '';

        return supportedCities.some(city => 
          placeName.includes(city) || 
          (feature.context || []).some(ctx => 
            ctx.text && supportedCities.includes(ctx.text)
          )
        );
      });
      

      setAadressSoovitused(filteredFeatures.slice(0, 5));
      
      if (filteredFeatures.length === 0 && data.features && data.features.length > 0) {
      }
    } catch (error) {
      setAadressSoovitused([]);
    } finally {
      setLaebSoovitusi(false);
    }
  };

  const debouncedFetchAadressSoovitused = useCallback(debounce(fetchAadressSoovitused, 300), []);

  useEffect(() => {
    if (!isSelectingAddress.current) {
      debouncedFetchAadressSoovitused(aadressOtsing);
    }
  }, [aadressOtsing, debouncedFetchAadressSoovitused]);

  const handleAadressValik = (feature) => {
    isSelectingAddress.current = true; 
    setValitudAadress(feature);
    setAadressOtsing(feature.place_name);
    setAadressSoovitused([]);
    
    if (feature.center && feature.center.length === 2) {
      // tagastab koordinaadid
      setKoordinaadid({ longitude: feature.center[0], latitude: feature.center[1] });
    } else {
       setKoordinaadid(null);
    }
    
    // sellega prg jama varsti vaja chegoda
    setTimeout(() => {
      isSelectingAddress.current = false;
    }, 100);
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
      alert('Viga ennustuse tegemisel. Palun proovige uuesti.');
    } finally {
      setEnnustusteLaeb(false);
    }
  };

  return (
    <div className="mudel-container p-4 md:p-6 space-y-8">

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mudel-card p-6 space-y-6">
        <PillSelector
          silt="Kinnisvara tüüp"
          valik1={KINNISVARA_TÜÜBID[0].name}
          valik2={KINNISVARA_TÜÜBID[1].name}
          valitudValik={kinnisvaraTüüp}
          onVali={setKinnisvaraTüüp}
        />

        {kinnisvaraTüüp !== 'Maja' && (
          <div>
            <label htmlFor="ehitusaasta" className="block text-sm font-medium text-gray-700 mb-1">Ehitusaasta</label>
            <input
              type="number"
              id="ehitusaasta"
              value={ehitusaasta}
              onChange={(e) => setEhitusaasta(e.target.value)}
              placeholder="Nt 2005"
              className="input-field w-full"
            />
          </div>
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <Valikuriba
            silt="Energiaklass"
            valikud={energiaklassiValikud}
            valitudVäärtus={energiaklass}
            onVali={setEnergiaklass}
          />
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <div>
            <label htmlFor="pindala" className="block text-sm font-medium text-gray-700 mb-1">Pindala (m²) *</label>
            <input
              type="number"
              id="pindala"
              value={pindala}
              onChange={(e) => setPindala(e.target.value)}
              placeholder="Nt 75"
              className="input-field w-full"
              required
            />
          </div>
        )}

        {kinnisvaraTüüp === 'Maja' && (
          <div>
            <label htmlFor="krundiPind" className="block text-sm font-medium text-gray-700 mb-1">Krundi pind (m²)</label>
            <input
              type="number"
              id="krundiPind"
              value={krundiPind}
              onChange={(e) => setKrundiPind(e.target.value)}
              placeholder="Nt 800"
              className="input-field w-full"
            />
          </div>
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <Valikuriba
            silt="Seisukord"
            valikud={seisukorraValikud}
            valitudVäärtus={seisukord}
            onVali={setSeisukord}
          />
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <Valikuriba
            silt="Materjal"
            valikud={materjalValikud}
            valitudVäärtus={materjalKategooria}
            onVali={setMaterjalKategooria}
          />
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="korrus" className="block text-sm font-medium text-gray-700 mb-1">Korrus</label>
              <input
                type="number"
                id="korrus"
                value={korrus}
                onChange={(e) => setKorrus(e.target.value)}
                placeholder="Nt 3"
                className="input-field w-full"
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
                className="input-field w-full"
              />
            </div>
          </div>
        )}
        
        {kinnisvaraTüüp !== 'Maja' && (
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
                className="input-field w-16 text-center"
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
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <PillSelector
            silt="Rõdu/Terrass"
            valik1="Jah"
            valik2="Ei"
            valitudValik={rõduTerrass}
            onVali={setRõduTerrass}
          />
        )}

        {kinnisvaraTüüp !== 'Maja' && rõduTerrass === 'Jah' && (
          <PillSelector
            silt="Suur rõdu või terrass (> 6 m²)"
            valik1="Jah"
            valik2="Ei"
            valitudValik={suurRõdu}
            onVali={setSuurRõdu}
          />
        )}

        {kinnisvaraTüüp !== 'Maja' && (
          <div className="relative">
            <label htmlFor="aadress" className="block text-sm font-medium text-gray-700 mb-1">Aadress *</label>
            <input
              type="text"
              id="aadress"
              value={aadressOtsing}
              onChange={(e) => setAadressOtsing(e.target.value)}
              placeholder="Otsi aadressi (nt Pae 1, Tallinn)"
              className="input-field w-full"
              autoComplete="off"
            />
            {laebSoovitusi && <div className="absolute right-2 top-9 text-xs text-gray-500">Laen...</div>}
            {aadressSoovitused.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                {aadressSoovitused.map((feature) => (
                  <li
                    key={feature.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      handleAadressValik(feature);
                    }}
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
              </div>
            )}
            {valitudAadress && !koordinaadid && aadressOtsing && (
               <div className="mt-2 p-2 bg-yellow-100 rounded-md text-sm">
                 <p className="font-semibold">Koordinaate ei leitud valitud aadressile.</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={ennustusteLaeb || kinnisvaraTüüp === 'Maja'}
          className="calculate-button w-full"
        >
          {kinnisvaraTüüp === 'Maja' ? (
            'Majad ei ole hetkel toetatud'
          ) : ennustusteLaeb ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Arvutan hinda...
            </>
          ) : (
            'Arvuta hind'
          )}
        </button>
      </div>
        </div>

        {(
          <div className="flex-1">
            <div className="mudel-card p-6 space-y-6 result-enter">
              
              <div className="space-y-4">
                <div className="prediction-result p-6">
                  <h4 className="font-bold text-white mb-4 text-center text-xl">Ennustatud hind</h4>
                  <div className="text-center space-y-3">
                    {ennustus ? (
                      <>
                        <p className="price-display">
                          {ennustus.pricePerM2.toLocaleString()} €/m²
                        </p>
                        <p className="total-price">
                          Koguhind: {ennustus.totalPrice.toLocaleString()} €
                        </p>
                        {ennustus.confidenceRange && (
                          <div className="mt-2 text-sm text-white/80">
                            Usaldusvahemik: {ennustus.confidenceRange.lower.toLocaleString()} - {ennustus.confidenceRange.upper.toLocaleString()} €
                          </div>
                        )}
                        {ennustus.neighborhoodAvg && (
                          <div className="mt-2 text-xs text-white/60">
                            Piirkonna keskmine: {Math.round(ennustus.neighborhoodAvg)} €/m²
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-white/70">
                        <p className="price-display text-white/50">-</p>
                        <p className="total-price text-white/50">-</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="parameters-grid">
                <h4 className="font-bold text-gray-800 mb-4 text-center col-span-full">Mudeli Sisendparameetrid</h4>
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="parameter-item">
                    <div className="parameter-label">Pindala:</div>
                    <div className="parameter-value">{sisendParameetrid ? `${sisendParameetrid.pindala_numeric} m²` : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Tubade arv:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.tube : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Vanus:</div>
                    <div className="parameter-value">{sisendParameetrid ? `${sisendParameetrid.vanus} aastat` : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Korrus:</div>
                    <div className="parameter-value">{sisendParameetrid ? `${sisendParameetrid.korrus}/${sisendParameetrid.korruseid}` : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Linn:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.city : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Asum:</div>
                    <div className="parameter-value">{sisendParameetrid && sisendParameetrid.district ? sisendParameetrid.district : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Kaugus keskusest:</div>
                    <div className="parameter-value">{sisendParameetrid ? `${(sisendParameetrid.distance_from_center/1000).toFixed(1)} km` : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Kohvikud 500m:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.kohvikud_500m : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Restoranid 500m:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.restod_500m : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Poed 500m:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.poed_500m : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Energiaklass:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.energiaklass : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Seisukord:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.seisukord_kategooria : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Materjal:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.materjal_kategooria : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Miljööala:</div>
                    <div className="parameter-value">
                      {sisendParameetrid ? (
                        sisendParameetrid.is_miljooala ? 'Miljööalas' : 
                        sisendParameetrid.near_miljooala_100m ? 'Lähedal (< 100m)' :
                        sisendParameetrid.near_miljooala_250m ? 'Lähedal (< 250m)' :
                        sisendParameetrid.near_miljooala_500m ? 'Lähedal (< 500m)' : 'Ei'
                      ) : '-'}
                    </div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Rõdu/terrass:</div>
                    <div className="parameter-value">{sisendParameetrid ? (sisendParameetrid.balcony_terrace_presence ? 'Jah' : 'Ei') : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Suur rõdu/terrass:</div>
                    <div className="parameter-value">{sisendParameetrid ? (sisendParameetrid['Suur rõdu või terrass'] ? 'Jah' : 'Ei') : '-'}</div>
                  </div>
                  {sisendParameetrid && sisendParameetrid.objekti_tüüp === 'Maja' && sisendParameetrid.krundi_pindala_numeric > 0 && (
                    <div className="parameter-item">
                      <div className="parameter-label">Krundi pind:</div>
                      <div className="parameter-value">{sisendParameetrid.krundi_pindala_numeric} m²</div>
                    </div>
                  )}
                  <div className="parameter-item">
                    <div className="parameter-label">m²/tuba:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.area_per_room.toFixed(1) : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Suhteline korrus:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.floor_ratio.toFixed(2) : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">X koordinaat (EPSG:3301):</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.x : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Y koordinaat (EPSG:3301):</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.y : '-'}</div>
                  </div>
                  <div className="parameter-item">
                    <div className="parameter-label">Arhitektuuriajastu:</div>
                    <div className="parameter-value">{sisendParameetrid ? sisendParameetrid.architectural_era : '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mudel;