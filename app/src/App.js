import React, { useState } from 'react';
import Kylgriba from './components/Kylgriba';
import Kaart from './pages/Kaart'; 
import Mudel from './pages/Mudel'; 
import { Menu } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('map'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const renderPage = () => {
    switch (currentPage) {
      case 'map':
        return <Kaart />;
      case 'ennustus':
        return <Mudel />;
      default:
        return <Kaart />; 
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Kylgriba 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">



        <header className="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4">
           <div></div>
          <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-gray-800">
            <Menu size={24} />
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>



      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={toggleMobileMenu} 
        ></div>
      )}
    </div>
  );
}
