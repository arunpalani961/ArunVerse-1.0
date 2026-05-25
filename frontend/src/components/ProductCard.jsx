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
    <div className="group h-full bg-white overflow-hidden transition-all duration-300 sm:rounded-md sm:shadow-sm sm:hover:shadow-lg sm:border sm:border-gray-200 sm:hover:border-[#ff9900]">
      {/* Image Container */}
      <button
        type="button"
        className="relative block aspect-square w-full overflow-hidden bg-[#f2f2f2] text-left cursor-pointer sm:aspect-auto sm:h-52 md:h-64"
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
      <div className="pt-3 sm:p-5 md:p-6 flex flex-col h-full justify-between">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-start justify-between gap-2 sm:mb-3">
            <span className="block text-[13px] font-extrabold uppercase tracking-wide text-[#111827] sm:hidden">
              {product.category}
            </span>
            <span className="hidden text-xs px-2 py-1 bg-[#fef3c7] text-[#92400e] rounded-full whitespace-nowrap sm:block">
              {product.category}
            </span>
          </div>
          <div className="mb-1 sm:mb-3">
            <button
              type="button"
              onClick={handleClick}
              className="min-h-9 w-full text-left text-[15px] sm:text-lg font-normal sm:font-bold leading-snug text-[#202124] sm:text-[#111827] line-clamp-2 underline-offset-4 hover:text-[#b45309] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2"
            >
              {product.title}
            </button>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="block w-full min-h-9 text-left text-[13px] sm:text-sm font-semibold text-[#111827] sm:text-gray-600 line-clamp-2 sm:line-clamp-3 hover:text-[#374151] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2"
          >
            {product.description}
          </button>
          <button
            type="button"
            onClick={handleClick}
            className="mt-1 block min-h-8 text-left text-[13px] font-bold text-[#111827] sm:hidden"
          >
            {product.clicks || 0} clicks
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 hidden pt-3 sm:pt-4 border-t border-gray-200 sm:flex items-center justify-between gap-3">
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
