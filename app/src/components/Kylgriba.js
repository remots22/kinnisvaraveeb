import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { NAV_ELEMENDID, MUUD_ELEMENDID } from '../constants';

const Kylgriba = ({ currentPage, setCurrentPage, isMobileMenuOpen, toggleMobileMenu }) => {
  const [indikaatoriStiil, setIndikaatoriStiil] = useState({ top: 0, height: 0, opacity: 0 });
  const navRef = useRef(null);
  const kirjeViitedRef = useRef({});
  const esmaneLaadimineValmis = useRef(false);

  useEffect(() => {
    const aktiivneLinkElement = kirjeViitedRef.current[currentPage];
    if (aktiivneLinkElement && navRef.current) {
      const elemendiY = aktiivneLinkElement.offsetTop;
      const elemendiKorgus = aktiivneLinkElement.offsetHeight;
      
      setIndikaatoriStiil({
        top: elemendiY,
        height: elemendiKorgus,
        opacity: 1,
      });

      if (!esmaneLaadimineValmis.current) {
        setTimeout(() => {
          esmaneLaadimineValmis.current = true;
        }, 50);
      }
    } else {
      const onPeamineNaviElement = (NAV_ELEMENDID || []).some(element => element.leht === currentPage);
      if (!onPeamineNaviElement) {
         setIndikaatoriStiil(prev => ({ ...prev, opacity: 0 }));
      }
    }
  }, [currentPage, isMobileMenuOpen]);

  const NaviElementLink = ({ element }) => (
    <button
      ref={domElement => kirjeViitedRef.current[element.leht] = domElement}
      onClick={() => {
        setCurrentPage(element.leht);
        if (isMobileMenuOpen) toggleMobileMenu();
      }}
      className={`relative z-10 flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none
        ${currentPage === element.leht ? 'text-white' : 'text-gray-600 hover:text-gray-800'}`}
    >
      {element.ikoon}
      <span>{element.nimi}</span>
    </button>
  );

  const AlamNaviElementLink = ({ element }) => (
    <button
      onClick={() => {
        setCurrentPage(element.leht);
        if (isMobileMenuOpen) toggleMobileMenu();
      }}
      className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none
        ${currentPage === element.leht ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}
        pl-10`}
    >
      {element.ikoon}
      <span>{element.nimi}</span>
    </button>
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-700">Kinnisvara</h1>
        <button onClick={toggleMobileMenu} className="md:hidden text-gray-600 hover:text-gray-800">
          <X size={24} />
        </button>
      </div>
      <nav ref={navRef} className="relative py-6 px-4 space-y-2 flex-grow">
        <div
          className={`absolute bg-blue-600 rounded-lg shadow-md pointer-events-none
            ${esmaneLaadimineValmis.current ? 'transition-all duration-300 ease-in-out' : ''}`}
          style={{
            left: '1rem', 
            right: '1rem', 
            top: `${indikaatoriStiil.top}px`,
            height: `${indikaatoriStiil.height}px`,
            opacity: indikaatoriStiil.opacity,
            zIndex: 0, 
          }}
        />
        {(NAV_ELEMENDID || []).map((element) => 
          <NaviElementLink key={element.leht + "_main"} element={element} />
        )}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Muu</h3>
          <div className="mt-2 space-y-1">
            {(MUUD_ELEMENDID || []).map((element) => 
              <AlamNaviElementLink key={element.leht + "_other"} element={element} />
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Kylgriba;
