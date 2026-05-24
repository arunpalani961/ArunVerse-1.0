import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#131921] border-b border-[#febd69]/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="min-w-0">
          <span className="block text-2xl font-bold text-white leading-tight">
            ArunVerse
          </span>
          <span className="block text-xs sm:text-sm text-[#febd69] leading-tight">
            Products Worth Your Click
          </span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {isAdmin && (
            <>
              <Link to="/admin" className="px-4 py-2 text-white hover:text-[#febd69] transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#febd69] text-[#111827] rounded hover:bg-[#f3a847] transition font-semibold"
              >
                Logout
              </button>
            </>
          )}
          <span className="whitespace-nowrap text-[11px] sm:text-xs text-gray-300">
            Version 1.0
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
