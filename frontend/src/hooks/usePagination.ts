import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const resetPage = () => setPage(1);

  return {
    page,
    setPage,
    limit,
    setLimit,
    resetPage,
  };
};
