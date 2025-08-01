import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useGetProductExperienceFilterByIdKey = (productId, filters) => [
    "product",
    "activities-filter",
    productId,
    filters,
];
export const useGetProductExperienceFilterById = (
    productId,
    filters = {},
    queryOptions
) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useGetProductExperienceFilterByIdKey(productId, filters),
        queryFn: () =>
            myAxios
                .get(`/product/get-product-experiences-by-id/${productId}`, {
                    params: {
                        ...(filters.user_id?.length > 0 && {
                            user_id: filters.user_id.join(","),
                        }),
                    },
                })
                .then((res) => {
                    queryOptions?.onSuccess?.(res.data);
                    return res.data;
                }),
        ...queryOptions,
    });
};


export const useProductExperienceByIdKey = (id) => [
    "product-experiences-id",
    id,
];
export const useProductExperienceById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductExperienceByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-experiences-by-id/${id}/`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const usExperienceListKey = ["list", "experience"];
export const usExperienceList = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: usExperienceListKey,
        queryFn: () =>
            myAxios.get(`/experience/get-experience/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};

export const useCreateExperience = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-experience/`, params, {
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

export const useDeleteExperience = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/product/delete-experience/${params}/`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateExperience = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({ExperienceId, ...params}) => {
            return myAxios
                .put(`/product/update-experience/${ExperienceId}/`, params, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => response?.data);
        },
    });
};
