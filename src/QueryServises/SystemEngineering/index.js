import {useMyAxios} from "@/hooks/useMyAxios.js";
import {useMutation, useQuery} from "@tanstack/react-query";

export const useSystemEngineeringListKey = ["list", "requirement"];
export const useSystemEngineeringList = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useSystemEngineeringListKey,
        queryFn: () =>
            myAxios.get(`/core/get-system-engineering/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};

export const useCreateSystemEngineering = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/core/add-system-engineering/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateSystemEngineering = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({SystemEngineerId, ...params}) => {
            return myAxios
                .put(`/core/update-system-engineering/${SystemEngineerId}`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useDeleteSystemEngineer = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/core/delete-system-engineering/${params}`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};