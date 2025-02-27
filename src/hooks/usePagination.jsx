import { useState } from 'react';

const usePagination = (data, itemsPerPage) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return {
        currentPage,
        handlePageChange,
        paginatedData,
    };
};

export default usePagination;