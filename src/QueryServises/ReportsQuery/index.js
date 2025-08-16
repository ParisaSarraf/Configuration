import {useMyAxios} from "@/hooks/useMyAxios.js";
import {useQuery} from "@tanstack/react-query";

export const useGetEditionCountReport = (id, filters = {}, queryOptions = {}) => {

    const myAxios = useMyAxios();
    return useQuery({
        queryKey: [
            "edition-count-report",
            id,
            JSON.stringify(filters),
        ],

        queryFn: () =>
            myAxios
                .get(`/get-edition-count-report/${id}/`, {
                    params: {
                        states: filters.states.join(','),
                        with_children: filters.with_children
                    },
                })
                .then((response) => response.data),
        ...queryOptions,
    });
};

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