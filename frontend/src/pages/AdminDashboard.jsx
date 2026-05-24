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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Admin Dashboard
        </h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/20 p-6">
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-4xl font-bold text-purple-400">{analytics.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/20 p-6">
              <p className="text-gray-400 text-sm">Total Clicks</p>
              <p className="text-4xl font-bold text-pink-400">{analytics.totalClicks}</p>
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
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/20 p-8 mb-12">
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
                className="col-span-1 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="col-span-1 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
              />
              <textarea
                placeholder="Product Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="col-span-1 md:col-span-2 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 h-24"
              />
              <input
                type="url"
                placeholder="Product Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="col-span-1 md:col-span-2 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
              />
              <input
                type="url"
                placeholder="Product Link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
                className="col-span-1 md:col-span-2 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
              />
              <button
                type="submit"
                className="col-span-1 md:col-span-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/20 overflow-hidden">
          <h2 className="text-2xl font-bold p-6 border-b border-gray-700">Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700 bg-black/90">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Clicks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700 hover:bg-black/30">
                    <td className="px-6 py-4 text-sm">{product.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-pink-400">{product.clicks || 0}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-xs"
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
