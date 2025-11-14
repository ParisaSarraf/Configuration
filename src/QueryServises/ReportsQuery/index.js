import { useMyAxios } from "@/hooks/useMyAxios.js";
import { useQuery } from "@tanstack/react-query";


export const useGetProductDocumentReport = (id, filters = {}, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: [
            "product-document-report",
            id,
            filters,
        ],
        queryFn: () =>
            myAxios
                .get(`/product/get-product-document-report/${id}/`, {
                    params: {
                        ...filters
                    },
                })
                .then((response) => response.data),
        ...queryOptions,
    });
};


export const useGetProductDocumentReportCsv = (id, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-children", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-document-report-csv/${id}/`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};



export const useGetEditionsCountReport = (id, filters = {}, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: ['get-editions-count-report', id, filters,],
        queryFn: () =>
            myAxios
                .get(`/product/get-edition-count-report/${id}/`, {
                    params: {
                        ...filters,
                    }
                })
                .then((response) => response.data),
        ...queryOptions,
    })
}