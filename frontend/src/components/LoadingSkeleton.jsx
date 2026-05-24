import React from 'react';

const LoadingSkeleton = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-purple-500/20 animate-pulse">
          {/* Image Skeleton */}
          <div className="h-64 bg-gray-800" />
          
          {/* Content Skeleton */}
          <div className="p-6">
            <div className="h-6 bg-gray-700 rounded-lg mb-3 w-3/4" />
            <div className="h-4 bg-gray-700 rounded-lg mb-2 w-full" />
            <div className="h-4 bg-gray-700 rounded-lg mb-4 w-5/6" />
            
            <div className="pt-4 border-t border-gray-700/50 flex gap-2">
              <div className="h-10 bg-gray-700 rounded-lg flex-1" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
