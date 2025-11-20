'use client';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle';
  count?: number;
  className?: string;
}

/**
 * Loading Skeleton Component
 * Provides animated loading placeholders for better UX
 */
export default function LoadingSkeleton({ 
  type = 'card', 
  count = 1,
  className = ''
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md animate-pulse flex items-center space-x-4"
          >
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          ></div>
        ))}
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className={`flex space-x-4 ${className}`}>
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return null;
}
