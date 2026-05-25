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
    <nav className="sticky top-0 z-50 bg-white sm:bg-[#131921] border-b border-gray-200 sm:border-[#febd69]/40 shadow-sm sm:shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 sm:h-auto sm:py-3 grid grid-cols-[44px_1fr_92px] sm:flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center text-[#111827] sm:hidden"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        <Link to="/" className="min-w-0 text-center sm:text-left">
          <span className="block text-[28px] sm:text-2xl font-extrabold uppercase tracking-[0.08em] sm:tracking-normal text-[#111827] sm:text-white leading-tight">
            ArunVerse
          </span>
          <span className="hidden sm:block text-xs sm:text-sm text-[#febd69] leading-tight">
            Products Worth Your Click
          </span>
        </Link>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={openProductSearch}
            className="flex h-11 w-11 items-center justify-center text-[#111827] sm:hidden"
            aria-label="Search products"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
          </button>
          <Link
            to="/admin/login"
            className="flex h-11 w-9 items-center justify-center text-[#111827] sm:hidden"
            aria-label="Admin"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8h12l1 13H5L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin" className="hidden sm:inline-flex min-h-10 px-3 sm:px-4 py-2 text-sm sm:text-base text-white hover:text-[#febd69] transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex min-h-10 px-3 sm:px-4 py-2 bg-[#febd69] text-[#111827] rounded hover:bg-[#f3a847] transition text-sm sm:text-base font-semibold"
              >
                Logout
              </button>
            </>
          )}
          <span className="hidden sm:inline whitespace-nowrap text-[11px] sm:text-xs text-gray-300">
            Version 1.0
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
