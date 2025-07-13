import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useProductActivitiesKey = (productId) => ["product", "activities", productId];
export const useGetProductActivities = (productId, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductActivitiesKey(productId),
        queryFn: () =>
            myAxios.get(`/product/get-product-activity-by-id/${productId}`)
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
};

export const useProductActivitiesTypeKey = (productId, filters) => ["product", "activities", productId, filters];
export const useGetProductActivitiesType = (productId, filters = {}, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductActivitiesTypeKey(productId, filters),
        queryFn: () =>
            myAxios.get(`/product/get-product-meetings-by-id/${productId}`, {
                params: {
                    internal: filters.internal || undefined,
                    external: filters.external || undefined
                }
            })
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
};

export const useCreateActivity = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (activityData) => {
            return myAxios.post('/product/add-activity/', activityData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
                .then((response) => response?.data);
        },
    });
};

export const useUpdateActivity = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({activityId, ...activityData}) => {
            return myAxios.put(`/product/update-activity/${activityId}`, activityData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
                .then((response) => response?.data);
        },
    });
};

export const useDeleteActivity = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (activityId) => {
            return myAxios.delete(`/product/delete-activity/${activityId}`)
                .then((response) => response?.data);
        },
    });
};

export const useChangeActivityTrustee = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({trusteeId, trusteeData}) => {
            return myAxios.patch(
                `/product/change-activity-trustee/${trusteeId}`,
                trusteeData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            )
        },
    });
};

export const useChangePlanTrustee = () => {
    const {myAxios} = useMyAxios();

    return useMutation({
        mutationFn: ({planId, trusteeData}) => {
            return myAxios.patch(
                `/product/change-plan-trustee/${planId}`,
                trusteeData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            )
        },
    });
};