import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";


export const useGetConfirmedWarehouseRequestByIdKey = (id) => ["confirmed-request", id];
export const useGetConfirmedWarehouseRequestById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useGetConfirmedWarehouseRequestByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-confirmed-ware-house-request-by-id/${id}`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};


// export const useGetSupplyListForWareByIdKey = (id) => ;
export const useGetSupplyListForWareById = (id,construction = {}, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["supply-ware", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-supply-list-for-ware-by-id/${id}`,{
                        params: {construction}
                    })
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};


export const useGetUnConfirmedWareRequestByIdKey = (id) => ["un-confirmed-request", id];
export const useGetUnConfirmedWareRequestById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useGetUnConfirmedWareRequestByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-un-confirmed-ware-request-by-id/${id}`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};


export const useCreateRequestOfWarehouse = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-ware-house-request/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useCreateRequestOfWarehouseNumber = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-ware-house-request-number/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateRequestOfWarehouse = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({RequestOfWarehouseId, ...params}) => {
            return myAxios
                .put(`/product/update-ware-house-request/${RequestOfWarehouseId}`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useDeleteRequestOfWarehouse = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/product/delete-ware-house-request/${params}`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};


