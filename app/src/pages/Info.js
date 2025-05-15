import React from 'react';
import { KaartKomponent, JaotisePealkiri } from '../components/UIComponents';

const Teave = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <JaotisePealkiri>Informatsioon</JaotisePealkiri>
      <KaartKomponent>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Rakenduse kohta</h3>
        <p className="text-sm text-gray-600 mb-4">
          See teeb .... tekst githubist
        </p>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">techn</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
          <li>React.js frontend</li>
          <li>Lucide React ikoonid</li>
          <li>Mapbox GL JS</li>
          <li>kui töölaud teha ss siia ka</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Areng ja eesmärk</h3>
        <p className="text-sm text-gray-600 mb-4">
          githubist tekst
        </p>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Kontakt</h3>
        <p className="text-sm text-gray-600">
          for inf
          <a href="mailto:remo.tsernant.rt@gmail.com" className="text-blue-600 hover:underline ml-1">
            remo.tsernant.rt@gmail.com
          </a>
        </p>
      </KaartKomponent>
    </div>
  );
};
export default Teave;
