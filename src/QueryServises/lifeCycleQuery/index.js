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

export const useCreateLifeCycle = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/life-cycle/life-cycle/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteLifeCycle = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/life-cycle/life-cycle/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateLifeCycle = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ lifeCycleId, ...params }) => {
      return myAxios
        .put(`/life-cycle/life-cycle/${lifeCycleId}/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
