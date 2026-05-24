import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/login', { password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111827] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-md border border-gray-200 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2 text-[#131921]">
            Admin Portal
          </h1>
          <p className="text-center text-gray-600 mb-8">ArunVerse 1.0</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-[#111827] placeholder-gray-500 focus:outline-none focus:border-[#ff9900] transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed border border-[#fcd200]"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {import.meta.env.DEV && (
            <p className="text-center text-gray-500 text-xs mt-6">
              Default password: admin123
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
