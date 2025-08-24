import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "../../hooks/useMyAxios";

export const useProductKey = ["lists", "product"];
export const useProductList = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductKey,
        queryFn: () =>
            myAxios.get(`/product/get-product/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};

export const useProductByIdKey = (id) => ["product", id];
export const useProductById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-by-id/${id}`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useProductChildrenKey = (id) => ["product-children", id];
export const useProductChildren = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductChildrenKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-children-by-id/${id}/`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useFinalCodeProductByIdKey = (id) => ["product-parent-code", id];
export const useFinalCodeProductById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useFinalCodeProductByIdKey(id),
        queryFn: () => {
            if (!id) return Promise.resolve(null);
            return myAxios
                .get(`/product/get-product-parents-code/${id}`)
                .then((response) => {
                    return response?.data;
                });
        },
        ...queryOptions,
    });
};

export const useCreateProduct = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-product/`, params, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useDeleteProduct = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/product/delete-product/${params}/`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateProduct = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({productId, ...params}) => {
            return myAxios
                .put(`/product/update-product/${productId}/`, params, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateProductInfo = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({productId, ProductInfoData}) => {
            return myAxios
                .patch(`/product/patch-user-info/${productId}/`, ProductInfoData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                ).then((response) => {
                    return response?.data;
                })
        },
    });
};
