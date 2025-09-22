import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingFrom: number;
  showingTo: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showingFrom, 
  showingTo, 
  totalItems 
}) => {

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  // Helper function to create a range of page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, currentPage + Math.floor(maxPagesToShow / 2));

    let pageNumbers: (number | string)[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 1) {
      pageNumbers = [1, '...', ...pageNumbers];
    }
    if (endPage < totalPages) {
      pageNumbers = [...pageNumbers, '...', totalPages];
    }

    return pageNumbers;
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{showingFrom}</span> to{' '}
        <span className="font-medium">{showingTo}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <nav aria-label="Page navigation">
        <ul className="flex items-center -space-x-px h-8 text-sm">
          {/* Previous button */}
          <li
            onClick={() => hasPrevious && handlePageChange(currentPage - 1)}
            className={`cursor-pointer ${!hasPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <button
              className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white"
              disabled={!hasPrevious}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </button>
          </li>

          {/* Page number links */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <li key={index} className="flex items-center justify-center px-3 h-8 text-gray-500 dark:text-gray-400">
                  ...
                </li>
              );
            } else {
              return (
                <li key={page} onClick={() => handlePageChange(page as number)}>
                  <button
                    className={`flex items-center justify-center px-3 h-8 leading-tight border ${
                      page === currentPage
                        ? 'text-blue-600 dark:text-blue-400 border-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-800 dark:hover:text-white'
                        : 'text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white'
                    }`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </li>
              );
            }
          })}

          {/* Next button */}
          <li
            onClick={() => hasNext && handlePageChange(currentPage + 1)}
            className={`cursor-pointer ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <button
              className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white"
              disabled={!hasNext}
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
