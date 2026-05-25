import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const emptyProductForm = {
  title: '',
  description: '',
  image: '',
  link: '',
  category: '',
};

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'category_asc', label: 'Category A-Z' },
  { value: 'category_desc', label: 'Category Z-A' },
  { value: 'clicks_desc', label: 'Most clicks' },
  { value: 'clicks_asc', label: 'Fewest clicks' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState(emptyProductForm);
  const [productQuery, setProductQuery] = useState({
    page: 1,
    limit: 10,
    sort: 'newest',
    search: '',
  });
  const [productPagination, setProductPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });
  const navigate = useNavigate();

  const categoryNames = useMemo(
    () => categories.map(category => category.name || category),
    [categories]
  );

  const handleAuthError = useCallback((requestError) => {
    if (requestError.response?.status === 401) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return true;
    }
    return false;
  }, [navigate]);

  const fetchAnalytics = useCallback(async () => {
    const res = await api.get('/admin/analytics');
    setAnalytics(res.data);
  }, []);

  const fetchStatus = useCallback(async () => {
    const res = await api.get('/admin/status');
    setStorageStatus(res.data);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await api.get('/admin/categories');
    setCategories(res.data);
  }, []);

  const fetchProducts = useCallback(async (query = productQuery) => {
    setProductsLoading(true);
    try {
      const res = await api.get('/admin/products', {
        params: {
          page: query.page,
          limit: query.limit,
          sort: query.sort,
          ...(query.search && { search: query.search }),
        },
      });
      setProducts(res.data.products);
      setProductPagination({
        total: res.data.total,
        pages: res.data.pages || 1,
        currentPage: res.data.currentPage,
      });
    } catch (requestError) {
      if (!handleAuthError(requestError)) {
        setError('Unable to load products.');
      }
    } finally {
      setProductsLoading(false);
    }
  }, [handleAuthError, productQuery]);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([fetchAnalytics(), fetchCategories(), fetchStatus()]);
      } catch (requestError) {
        if (!handleAuthError(requestError)) {
          setError('Unable to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [fetchAnalytics, fetchCategories, fetchStatus, handleAuthError]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await api.get('/admin/products', {
          params: {
            page: productQuery.page,
            limit: productQuery.limit,
            sort: productQuery.sort,
            ...(productQuery.search && { search: productQuery.search }),
          },
        });
        setProducts(res.data.products);
        setProductPagination({
          total: res.data.total,
          pages: res.data.pages || 1,
          currentPage: res.data.currentPage,
        });
      } catch (requestError) {
        if (!handleAuthError(requestError)) {
          setError('Unable to load products.');
        }
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [handleAuthError, productQuery]);

  const refreshDashboard = async () => {
    await Promise.all([fetchAnalytics(), fetchProducts(), fetchCategories(), fetchStatus()]);
  };

  const resetProductForm = () => {
    setFormData(emptyProductForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryNames.includes(formData.category)) {
      setError('Please select a valid category before saving the product.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData);
      } else {
        await api.post('/admin/products', formData);
      }

      resetProductForm();
      setShowForm(false);
      await refreshDashboard();
    } catch (requestError) {
      if (!handleAuthError(requestError)) {
        setError(requestError.response?.data?.message || 'Error saving product.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        await refreshDashboard();
      } catch (requestError) {
        if (!handleAuthError(requestError)) {
          setError(requestError.response?.data?.message || 'Error deleting product.');
        }
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      image: product.image,
      link: product.link,
      category: product.category,
    });
    setEditingId(product.id);
    setShowForm(true);
    setActiveTab('products');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmedName = newCategory.trim();
    setCategoryMessage('');

    if (!trimmedName) {
      setCategoryMessage('Category name is required.');
      return;
    }

    if (categoryNames.some(category => category.toLowerCase() === trimmedName.toLowerCase())) {
      setCategoryMessage('That category already exists.');
      return;
    }

    try {
      await api.post('/admin/categories', { name: trimmedName });
      setNewCategory('');
      setCategoryMessage('Category added.');
      await fetchCategories();
    } catch (requestError) {
      if (!handleAuthError(requestError)) {
        setCategoryMessage(requestError.response?.data?.message || 'Error adding category.');
      }
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (window.confirm(`Delete category "${categoryName}"?`)) {
      try {
        await api.delete(`/admin/categories/${encodeURIComponent(categoryName)}`);
        setCategoryMessage('Category deleted.');
        await fetchCategories();
      } catch (requestError) {
        if (!handleAuthError(requestError)) {
          setCategoryMessage(requestError.response?.data?.message || 'Error deleting category.');
        }
      }
    }
  };

  const changeProductQuery = (updates) => {
    setProductQuery(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaeded] text-[#111827] flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111827] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#131921]">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {storageStatus && !storageStatus.persistent && (
          <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Database is not connected. Products and categories added here are temporary and can disappear after the backend restarts.
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-4xl font-bold text-[#131921]">{analytics.totalProducts}</p>
            </div>
            <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-600 text-sm">Total Clicks</p>
              <p className="text-4xl font-bold text-[#b45309]">{analytics.totalClicks}</p>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-md border border-gray-300 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                activeTab === 'products' ? 'bg-[#232f3e] text-white' : 'text-[#111827] hover:bg-[#f7fafa]'
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                activeTab === 'categories' ? 'bg-[#232f3e] text-white' : 'text-[#111827] hover:bg-[#f7fafa]'
              }`}
            >
              Categories
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                resetProductForm();
              }}
              className="px-6 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all duration-300 font-semibold border border-[#fcd200]"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          )}
        </div>

        {activeTab === 'products' && (
          <>
            {showForm && (
              <div className="bg-white rounded-md border border-gray-200 p-8 mb-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Product Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="col-span-1 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="col-span-1 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] focus:outline-none focus:border-[#ff9900]"
                  >
                    <option value="">Select category</option>
                    {categoryNames.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Product Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="col-span-1 md:col-span-2 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900] h-24"
                  />
                  <input
                    type="url"
                    placeholder="Product Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    required
                    className="col-span-1 md:col-span-2 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
                  />
                  <input
                    type="url"
                    placeholder="Product Link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    required
                    className="col-span-1 md:col-span-2 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
                  />
                  <button
                    type="submit"
                    disabled={categoryNames.length === 0}
                    className="col-span-1 md:col-span-2 px-6 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all font-semibold border border-[#fcd200] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Products</h2>
                  <p className="text-sm text-gray-600">
                    Showing {products.length} of {productPagination.total} products
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    placeholder="Search products"
                    value={productQuery.search}
                    onChange={(e) => changeProductQuery({ search: e.target.value })}
                    className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
                  />
                  <select
                    value={productQuery.sort}
                    onChange={(e) => changeProductQuery({ sort: e.target.value })}
                    className="w-full sm:w-48 px-4 py-2 bg-white border border-gray-300 rounded text-[#111827] focus:outline-none focus:border-[#ff9900]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={productQuery.limit}
                    onChange={(e) => changeProductQuery({ limit: Number(e.target.value) })}
                    className="w-full sm:w-32 px-4 py-2 bg-white border border-gray-300 rounded text-[#111827] focus:outline-none focus:border-[#ff9900]"
                  >
                    {[5, 10, 20, 50].map(limit => (
                      <option key={limit} value={limit}>{limit} / page</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-[#232f3e]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Clicks</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-gray-600">Loading products...</td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-200 hover:bg-[#f7fafa]">
                          <td className="px-6 py-4 text-sm">{product.title}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-[#fef3c7] text-[#92400e] rounded-full text-xs">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#b45309]">{product.clicks || 0}</td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 bg-[#e3f2fd] text-[#0f566b] rounded hover:bg-[#d1e7f0] transition text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-gray-600">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {productPagination.pages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={() => changeProductQuery({ page: Math.max(1, productQuery.page - 1) })}
                    disabled={productQuery.page === 1}
                    className="px-4 py-2 bg-white text-[#111827] border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7fafa] transition"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {productPagination.currentPage} of {productPagination.pages}
                  </span>
                  <button
                    onClick={() => changeProductQuery({ page: Math.min(productPagination.pages, productQuery.page + 1) })}
                    disabled={productQuery.page >= productPagination.pages}
                    className="px-4 py-2 bg-white text-[#111827] border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7fafa] transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Categories</h2>
              <p className="text-sm text-gray-600">These values appear in the Add New Product category dropdown.</p>
            </div>

            <form onSubmit={handleAddCategory} className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all font-semibold border border-[#fcd200] whitespace-nowrap"
              >
                Add Category
              </button>
            </form>

            {categoryMessage && (
              <p className="mb-4 text-sm text-[#92400e]">{categoryMessage}</p>
            )}

            <div className="divide-y divide-gray-200 border border-gray-200 rounded">
              {categoryNames.length > 0 ? (
                categoryNames.map(category => (
                  <div key={category} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="font-medium text-[#111827]">{category}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-600">No categories added yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
