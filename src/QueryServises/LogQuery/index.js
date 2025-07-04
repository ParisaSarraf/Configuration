import {useMyAxios} from "@/hooks/useMyAxios";
import {useQuery} from "@tanstack/react-query";

export const useLogListKey = (id, state, model) => ["lists", "logs", id, state, model];

export const useLogList = ({id, state, model, ...queryOptions}) => {
    const {myAxios} = useMyAxios();

    return useQuery({
        queryKey: useLogListKey(id, state, model),
        queryFn: () =>
            myAxios.get(`/spi/v1/product/get-change-state-logs/${id}/${state}/${model}`)
                .then((response) => {
                    queryOptions?.onSuccess?.(response?.data);
                    return response?.data;
                }),
        ...queryOptions,
    });
};