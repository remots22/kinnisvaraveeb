import React, { useState, useEffect, useRef } from 'react';

export const KaartKomponent = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-4 md:p-6 ${className}`}>
    {children}
  </div>
);

export const JaotisePealkiri = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">{children}</h2>
);

export const Valikuriba = ({ valikud, valitudVäärtus, onVali, silt, konteineriKlass = 'w-full', nupuPolsterdus = 'px-4 py-1.5' }) => {
  const [indikaatoriStiil, setIndikaatoriStiil] = useState({ left: 0, width: 0, opacity: 0 });
  const konteinerRef = useRef(null);
  const nuppudeViitedRef = useRef({});
  const esmaneLaadimineValmis = useRef(false);

  useEffect(() => {
    const valitudIndeks = valikud.findIndex(valik => valik === valitudVäärtus);
    const aktiivneNuppElement = nuppudeViitedRef.current[valitudIndeks];
    
    if (aktiivneNuppElement && konteinerRef.current) {
      const indikaatoriNihe = aktiivneNuppElement.offsetLeft - konteinerRef.current.scrollLeft;

      setIndikaatoriStiil({
        left: indikaatoriNihe, 
        width: aktiivneNuppElement.offsetWidth,
        opacity: 1,
      });
      if (!esmaneLaadimineValmis.current) {
        setTimeout(() => esmaneLaadimineValmis.current = true, 50);
      }
    } else if (valikud.length > 0 && !aktiivneNuppElement && nuppudeViitedRef.current[0]) {
        const esimeneNuppElement = nuppudeViitedRef.current[0];
        if (esimeneNuppElement && konteinerRef.current) {
             const indikaatoriNihe = esimeneNuppElement.offsetLeft - konteinerRef.current.scrollLeft;
             setIndikaatoriStiil({
                 left: indikaatoriNihe,
                 width: esimeneNuppElement.offsetWidth,
                 opacity: 1,
             });
             if (!esmaneLaadimineValmis.current) {
                 setTimeout(() => esmaneLaadimineValmis.current = true, 50);
             }
        }
    }
  }, [valitudVäärtus, valikud, konteinerRef.current?.scrollLeft]); 

  return (
    <div className={konteineriKlass}>
      {silt && <label className="block text-sm font-medium text-gray-700 mb-1">{silt}</label>}
      <div 
        ref={konteinerRef} 
        className="relative bg-gray-200 p-1 rounded-lg shadow-sm flex space-x-1 w-full overflow-x-auto"
      >
        <div
          className={`absolute bg-white rounded shadow 
            ${esmaneLaadimineValmis.current ? 'transition-all duration-300 ease-in-out' : ''}`}
          style={{
            top: '0.25rem', 
            bottom: '0.25rem', 
            left: `${indikaatoriStiil.left}px`,
            width: `${indikaatoriStiil.width}px`,
            opacity: indikaatoriStiil.opacity,
            zIndex: 0,
          }}
        />
        {valikud.map((valik, indeks) => (
          <button
            key={valik} 
            ref={domElement => nuppudeViitedRef.current[indeks] = domElement} 
            onClick={() => onVali(valik)}
            type="button" 
            className={`relative z-10 ${nupuPolsterdus} text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none flex items-center justify-center whitespace-nowrap
              ${valitudVäärtus === valik 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-800' 
              }`}
          >
            {valik}
          </button>
        ))}
      </div>
    </div>
  );
};

export const PillSelector = ({ silt, valik1, valik2, valitudValik, onVali, valik2Disabled = false }) => {
  const onValik1Valitud = valitudValik === valik1;
  return (
    <div>
      {silt && <label className="block text-sm font-medium text-gray-700 mb-1">{silt}</label>}
      <div className="relative flex w-full bg-gray-200 rounded-full p-1 cursor-pointer">
        <div 
          className={`absolute top-1 bottom-1 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out`}
          style={{
            width: 'calc(50% - 0.25rem)', 
            left: onValik1Valitud ? '0.25rem' : 'calc(50% + 0.125rem)', 
          }}
        />
        <button
          type="button"
          onClick={() => onVali(valik1)}
          className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium text-center rounded-full focus:outline-none transition-colors duration-300
            ${onValik1Valitud ? 'text-blue-600' : 'text-gray-600 hover:text-gray-700'}`}
        >
          {valik1}
        </button>
        <button
          type="button"
          onClick={() => !valik2Disabled && onVali(valik2)}
          disabled={valik2Disabled}
          className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium text-center rounded-full focus:outline-none transition-colors duration-300
            ${valik2Disabled ? 'text-gray-400 cursor-not-allowed' : 
              !onValik1Valitud ? 'text-blue-600' : 'text-gray-600 hover:text-gray-700'}`}
        >
          {valik2}
        </button>
      </div>
    </div>
  );
};

export const SliderN = ({ id, silt, min, max, samm, vaartus, onMuutus, uhik, vaartuseLaiusKlass = "w-16" }) => {
  const protsent = ((Number(vaartus) - Number(min)) / (Number(max) - Number(min))) * 100;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{silt}</label>
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
                step={samm}
                value={vaartus} 
                onChange={onMuutus}
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
        <span className={`text-sm text-gray-600 text-right ${vaartuseLaiusKlass}`}>{vaartus} {uhik}</span>
      </div>
    </div>
  );
};

export const Tekstikast = React.forwardRef(({ 
  label, 
  väärtus, 
  onMuutus, 
  placeholder = '', 
  tüüp = 'text', 
  id,
  vigaTeade,
  disabled = false
}, ref) => {
  const komponendiId = id || `tekstikast-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="tekstikast-konteiner mb-4">
      {label && (
        <label 
          htmlFor={komponendiId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={tüüp}
        id={komponendiId}
        value={väärtus}
        onChange={onMuutus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
          vigaTeade ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {vigaTeade && (
        <p className="mt-1 text-sm text-red-600">{vigaTeade}</p>
      )}
    </div>
  );
});
