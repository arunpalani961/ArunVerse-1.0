import React from 'react';
import api from '../api/config';

const ProductCard = ({ product }) => {
  const handleClick = async () => {
    try {
      await api.post(`/products/${product.id}/click`);
      window.open(product.link, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
      window.open(product.link, '_blank');
    }
  };

  return (
    <div className="group h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/50">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-800 cursor-pointer" onClick={handleClick}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col h-full justify-between">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-white line-clamp-2">
              {product.title}
            </h2>
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full whitespace-nowrap">
              {product.category}
            </span>
          </div>
          <p className="text-gray-400 text-sm line-clamp-3">
            {product.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.clicks || 0} clicks
          </span>
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
