import api from '../api/config';

const ProductCard = ({ product }) => {
  const handleLinkClick = async (e) => {
    try {
      // Track the click asynchronously
      await api.post(`/products/${product.id}/click`);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    // Let the native link handler continue (opens in new tab)
  };

  return (
    <div className="group grid h-full grid-rows-[auto_1fr] bg-white overflow-hidden transition-all duration-300 sm:rounded-md sm:shadow-sm sm:hover:shadow-lg sm:border sm:border-gray-200 sm:hover:border-[#ff9900]">
      {/* Image Container */}
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="relative block w-full h-48 overflow-hidden bg-[#f2f2f2] text-left cursor-pointer sm:h-52 md:h-64"
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-300" />
      </a>

      {/* Content Container */}
      <div className="p-3 sm:p-5 md:p-6 flex min-h-[140px] sm:min-h-[188px] flex-col h-full justify-between gap-3">
        {/* Header */}
        <div>
          <div className="mb-2 sm:mb-2">
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="min-h-[32px] sm:min-h-[56px] w-full text-left text-[14px] sm:text-lg font-normal sm:font-bold leading-snug text-[#202124] sm:text-[#111827] line-clamp-2 underline-offset-4 hover:text-[#b45309] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2 capitalize block"
            >
              {product.title}
            </a>
          </div>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="block w-full text-left text-[12px] sm:text-sm font-semibold text-[#111827] sm:text-gray-600 line-clamp-2 sm:line-clamp-3 overflow-hidden hover:text-[#374151] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2 capitalize flex-grow"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.description}
          </a>
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 sm:pt-4 border-t border-gray-200 flex sm:flex items-center justify-between gap-2 sm:gap-3">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="min-h-10 shrink-0 px-4 py-2 bg-[#ffd814] text-[#111827] rounded-full hover:bg-[#f7ca00] transition-all duration-300 text-xs sm:text-sm font-semibold border border-[#fcd200] inline-block whitespace-nowrap"
          >
            View Product
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
