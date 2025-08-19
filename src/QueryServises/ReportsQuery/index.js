import {useMyAxios} from "@/hooks/useMyAxios.js";
import {useQuery} from "@tanstack/react-query";


export const useGetProductDocumentReport = (id, filters = {}, queryOptions = {}) => {
    const {myAxios} = useMyAxios();
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


export const useGetEditionsCountReport = (id, filters = {}, queryOptions = {}) => {
    const {myAxios} = useMyAxios();
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