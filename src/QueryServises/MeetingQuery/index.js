import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useProductMeetingsKey = (productId) => ["product", "meetings", productId];
export const useGetProductMeetings = (productId, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductMeetingsKey(productId),
        queryFn: () =>
            myAxios.get(`/api/v1/product/get-product-meetings-by-id/${productId}`)
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
};

export const useCreateMeeting = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (meetingData) => {
            return myAxios.post('/api/v1/product/add-meeting/', meetingData)
                .then((response) => response?.data);
        },
    });
};

export const useUpdateMeeting = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({meetingId, ...meetingData}) => {
            return myAxios.put(`/api/v1/product/update-meeting/${meetingId}`, meetingData)
                .then((response) => response?.data);
        },
    });
};

export const useDeleteMeeting = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (meetingId) => {
            return myAxios.delete(`/api/v1/product/delete-meeting/${meetingId}`)
                .then((response) => response?.data);
        },
    });
};