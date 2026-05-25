import { useState, useEffect } from 'react';
import api from '../api/config';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          ...(search && { search }),
          ...(category !== 'all' && { category }),
        };
        const res = await api.get('/products', { params });
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111827] overflow-x-hidden">

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 md:pt-10 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-[#232f3e] rounded-md shadow p-3 md:p-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 sm:px-5 py-3 bg-white border-2 border-transparent rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900] transition"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mb-5 sm:mb-7 md:mb-10">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`min-h-11 shrink-0 px-5 py-2 rounded-full text-sm sm:text-base transition ${
              category === 'all'
                ? 'bg-[#ff9900] text-[#111827] font-semibold'
                : 'bg-white text-[#111827] hover:bg-[#f7fafa] border border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`min-h-11 shrink-0 px-5 py-2 rounded-full text-sm sm:text-base transition ${
                category === cat
                  ? 'bg-[#ff9900] text-[#111827] font-semibold'
                  : 'bg-white text-[#111827] hover:bg-[#f7fafa] border border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-14 sm:pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            <LoadingSkeleton count={12} />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-8 sm:mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="min-h-11 shrink-0 px-4 py-2 bg-white text-[#111827] border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7fafa] transition"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-h-11 min-w-11 shrink-0 px-3 py-2 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-[#ff9900] text-[#111827] font-semibold'
                          : 'bg-white text-[#111827] hover:bg-[#f7fafa] border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="min-h-11 shrink-0 px-4 py-2 bg-white text-[#111827] border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7fafa] transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
