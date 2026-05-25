import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const openProductSearch = () => {
    window.dispatchEvent(new Event('openProductSearch'));
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-gray-50 to-white sm:bg-gradient-to-r sm:from-white sm:via-gray-50 sm:to-white border-b border-gray-200 shadow-sm sm:shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-[60px] sm:h-auto sm:py-2 flex items-center justify-between gap-2">
        <Link to="/" className="flex min-w-0 items-center gap-1 text-left">
          <img
            src="/arunverse-logo.svg?v=3"
            alt="ArunVerse"
            className="h-12 w-auto shrink-0 sm:h-16 sm:w-auto"
            aria-hidden="true"
          />
        </Link>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={openProductSearch}
            className="flex h-11 w-11 items-center justify-center text-[#0066CC] sm:hidden"
            aria-label="Search products"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
          </button>
          {isAdmin && (
            <>
              <Link to="/admin" className="hidden sm:inline-flex min-h-10 px-3 sm:px-4 py-2 text-sm sm:text-base text-[#0066CC] hover:text-[#FF6B35] transition font-semibold">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex min-h-10 px-3 sm:px-4 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#E55100] transition text-sm sm:text-base font-semibold"
              >
                Logout
              </button>
            </>
          )}
          <span className="hidden sm:inline whitespace-nowrap text-[11px] sm:text-xs text-[#0066CC] font-semibold">
            Version 1.0
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
