import React from 'react';
import { KaartKomponent, JaotisePealkiri } from '../components/UIComponents';

const Teave = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <JaotisePealkiri>Mudeli täpsus</JaotisePealkiri>
      <KaartKomponent>
        <div className="space-y-2 text-sm text-gray-700">
          <p>RMSE: 299.62 EUR/m²</p>
          <p>MAE: 210.51 EUR/m²</p>
          <p>R²: 0.9215</p>
          <p>MAPE: 7.86%</p>
        </div>
        <div className="mt-4">
          <a 
            href="https://github.com/remots22/kinnisvaraveeb" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            GitHub
          </a>
        </div>
      </KaartKomponent>
    </div>
  );
};
export default Teave;
