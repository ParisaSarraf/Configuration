import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useProductActivitiesKey = (productId) => ["product", "activities", productId];
export const useGetProductActivities = (productId, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductActivitiesKey(productId),
        queryFn: () =>
            myAxios.get(`/api/v1/product/got-product-activity-by-id/${productId}`)
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
            return myAxios.post('/api/v1/product/add-activity/', activityData)
                .then((response) => response?.data);
        },
    });
};

export const useUpdateActivity = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({activityId, ...activityData}) => {
            return myAxios.put(`/api/v1/product/update-activity/${activityId}`, activityData)
                .then((response) => response?.data);
        },
    });
};

export const useDeleteActivity = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (activityId) => {
            return myAxios.delete(`/api/v1/product/delete-activity/${activityId}`)
                .then((response) => response?.data);
        },
    });
};

export const useChangeActivityTrustee = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({activityId, trusteeData}) => {
            return myAxios.patch(`/api/v1/product/change-activity-trustee/${activityId}`, trusteeData)
                .then((response) => response?.data);
        },
    });
};

export const useChangePlanTrustee = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({planId, trusteeData}) => {
            return myAxios.patch(`/api/v1/product/change-plan-trustee/${planId}`, trusteeData)
                .then((response) => response?.data);
        },
    });
};