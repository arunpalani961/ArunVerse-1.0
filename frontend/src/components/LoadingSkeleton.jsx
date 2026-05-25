const LoadingSkeleton = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white overflow-hidden animate-pulse sm:rounded-md sm:border sm:border-gray-200">
          {/* Image Skeleton */}
          <div className="aspect-square bg-gray-200 sm:aspect-auto sm:h-52 md:h-64" />
          
          {/* Content Skeleton */}
          <div className="pt-3 sm:p-5 md:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 rounded-lg mb-3 w-3/4" />
            <div className="h-4 bg-gray-200 rounded-lg mb-2 w-full" />
            <div className="h-4 bg-gray-200 rounded-lg mb-4 w-5/6" />
            
            <div className="pt-4 border-t border-gray-200 flex gap-2">
              <div className="h-10 bg-gray-200 rounded-lg flex-1" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
