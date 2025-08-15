import {useMyAxios} from "@/hooks/useMyAxios.js";
import {useQuery} from "@tanstack/react-query";

export const useGetEditionCountReport = (id, filters = {}, queryOptions = {}) => {
    const  myAxios  = useMyAxios();

    return useQuery({
        queryKey: [
            "edition-count-report",
            id,
            filters,
        ],
        queryFn: () =>
            myAxios
                .get(`/api/v1/product/get-edition-count-report/${id}/`, {
                    params: {
                        document_tree_id: filters.document_tree_id,
                        files_number: filters.files_number,
                        states: filters.states,
                        with_children: filters.with_children,
                        // search: filters.search,
                        // ...filters.extraParams,
                    },
                })
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
}


export const useGetProductDocumentReport = (id, filters = {}, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: [
            "edition-count-report",
            id,
            filters,
        ],
        queryFn: () =>
            myAxios
                .get(`/product/get-product-document-report/${id}/`, {
                    params: {
                        document_tree_id: filters.document_tree_id,
                        files_number: filters.files_number,
                        states: filters.states,
                        with_children: filters.with_children,
                    },
                })
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
}