import { useState } from "react";

const usePagination = (data = [], pageSize) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginatedData = (data || []).slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return { currentPage, handlePageChange, paginatedData };
};

export default usePagination;
