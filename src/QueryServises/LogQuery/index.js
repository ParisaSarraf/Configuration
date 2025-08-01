import {useMyAxios} from "@/hooks/useMyAxios";
import {useQuery} from "@tanstack/react-query";

export const useLogListKey = (id, model, state) => ["lists", "logs", id, model, state];

export const useLogList = ({id, model, state, ...queryOptions}) => {
    const {myAxios} = useMyAxios();

    return useQuery({
        queryKey: useLogListKey(id, model, state),
        queryFn: () =>
            myAxios.get(`/product/get-change-state-logs/${id}/${state}/${model}`)
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
};