import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    category: '',
  });
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
        setProducts(res.data.recentProducts);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData);
      } else {
        await api.post('/admin/products', formData);
      }
      setFormData({ title: '', description: '', image: '', link: '', category: '' });
      setEditingId(null);
      setShowForm(false);
      
      // Refresh analytics
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        // Refresh analytics
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (error) {
        console.error('Error deleting product:', error);
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
        <h1 className="text-4xl font-bold mb-8 text-[#131921]">
          Admin Dashboard
        </h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

        {/* Add Product Button */}
        <div className="mb-12">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', description: '', image: '', link: '', category: '' });
            }}
            className="px-6 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all duration-300 font-semibold border border-[#fcd200]"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-md border border-gray-200 p-8 mb-12 shadow-sm">
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
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="col-span-1 px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900]"
              />
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
                className="col-span-1 md:col-span-2 px-6 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all font-semibold border border-[#fcd200]"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
          <h2 className="text-2xl font-bold p-6 border-b border-gray-200">Products</h2>
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
                {analytics?.recentProducts.map((product) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
