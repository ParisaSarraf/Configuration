import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useLifeCycleKey = ["lists", "lifeCycle"];
export const useLifeCycleList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useLifeCycleKey,
    queryFn: () =>
      myAxios.get(`/life-cycle/life-cycle/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};
