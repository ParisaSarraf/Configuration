import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "../../hooks/useMyAxios";

export const useReasonsEditingListKey = ["list", "core-reasons-editing"];
export const useReasonsEditingList = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useReasonsEditingListKey,
        queryFn: () =>
            myAxios.get(`/core/reasons-editing/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};

export const useReasonsEditingByIdKey = (id) => ["core-reasons-editing-by-id", id];
export const useReasonsEditingListById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useReasonsEditingByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/core/reasons-editing/${id}/`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useCreateReasonsEditing = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/core/reasons-editing/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};


export const useUpdateReasonsEditing = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({ReasonsEditingId, ...params}) => {
            return myAxios
                .put(`/core/reasons-editing/${ReasonsEditingId}/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useDeleteReasonsEditing = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/core/reasons-editing/${params}/`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};
