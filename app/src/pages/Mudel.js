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
  
  const [aadressOtsing, setAadressOtsing] = useState('');
  const [aadressSoovitused, setAadressSoovitused] = useState([]);
  const [valitudAadress, setValitudAadress] = useState(null);
  const [koordinaadid, setKoordinaadid] = useState(null); // siin hoitakse koordinaate
  const [laebSoovitusi, setLaebSoovitusi] = useState(false);

  const energiaklassiValikud = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

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

  const handleSubmit = () => {
    console.log('Ennustusmudeli sisend:', {
      kinnisvaraTüüp,
      ehitusaasta,
      energiaklass,
      pindala,
      tubadeArv,
      rõduTerrass,
      valitudAadress: valitudAadress ? valitudAadress.place_name : null,
      koordinaadid,
    });
    // päring
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen mudel-container">
      <JaotisePealkiri>Ennustusmudeli seadistamine</JaotisePealkiri>

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
          <label htmlFor="pindala" className="block text-sm font-medium text-gray-700 mb-1">Pindala (m²)</label>
          <input
            type="number"
            id="pindala"
            value={pindala}
            onChange={(e) => setPindala(e.target.value)}
            placeholder="Nt 75"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
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

        <div className="relative">
          <label htmlFor="aadress" className="block text-sm font-medium text-gray-700 mb-1">Aadress</label>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          OK
        </button>
      </KaartKomponent>
    </div>
  );
};

export default Mudel;