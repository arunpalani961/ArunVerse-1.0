import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative py-24 px-4 text-center z-10">
        {/* Decorative top accent */}
        <div className="flex justify-center mb-8">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        </div>
        
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-300 drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
          ArunVerse 1.0
        </h1>
        
        <div className="relative inline-block mb-12">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          <p className="relative text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
            Discover Amazing Products
          </p>
        </div>

        {/* Decorative bottom accent */}
        <div className="flex justify-center mt-8">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 mb-12 sticky top-20 z-40 py-4 bg-black/80 backdrop-blur-md rounded-xl border border-purple-500/20">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={handleSearchChange}
          className="w-full px-6 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition"
        />
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full transition ${
              category === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-900 text-gray-300 hover:text-white border border-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full transition ${
                category === cat
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-900 text-gray-300 hover:text-white border border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <LoadingSkeleton count={12} />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/30 transition"
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
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-900 text-gray-300 hover:text-white border border-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/30 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
