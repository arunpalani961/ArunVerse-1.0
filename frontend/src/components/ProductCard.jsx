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
    <div className="group h-full bg-white rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#ff9900]">
      {/* Image Container */}
      <button
        type="button"
        className="relative block h-40 w-full overflow-hidden bg-gray-100 text-left cursor-pointer sm:h-52 md:h-64"
        onClick={handleClick}
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-300" />
      </button>

      {/* Content Container */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full justify-between">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#111827] line-clamp-2">
              {product.title}
            </h2>
            <span className="text-xs px-2 py-1 bg-[#fef3c7] text-[#92400e] rounded-full whitespace-nowrap">
              {product.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 sm:line-clamp-3">
            {product.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500">
            {product.clicks || 0} clicks
          </span>
          <button
            onClick={handleClick}
            className="min-h-11 shrink-0 px-5 py-2 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all duration-300 text-sm font-semibold border border-[#fcd200]"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
