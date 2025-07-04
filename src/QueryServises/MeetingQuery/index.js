import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useProductMeetingsKey = (productId) => ["product", "meetings", productId];
export const useGetProductMeetings = (productId, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useProductMeetingsKey(productId),
        queryFn: () =>
            myAxios.get(`/product/get-product-meetings-by-id/${productId}`)
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
            return myAxios.post('/product/add-meeting/', meetingData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
                .then((response) => response?.data);
        },
    });
};

export const useUpdateMeeting = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({meetingId, ...meetingData}) => {
            return myAxios.put(`/product/update-meeting/${meetingId}`, meetingData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                .then((response) => response?.data);
        },
    });
};

export const useDeleteMeeting = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (meetingId) => {
            return myAxios.delete(`/product/delete-meeting/${meetingId}`)
                .then((response) => response?.data);
        },
    });
};