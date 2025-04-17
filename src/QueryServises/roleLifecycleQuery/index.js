import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useRoleLifeCycleListKey = ["lists", "roles-lifecycle"];
export const useRoleLifeCycleList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRoleLifeCycleListKey,
    queryFn: () =>
      myAxios.get(`/user/get-role-lifecycle/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useRoleLifeCycleByIdKey = (id) => [
  "role-lifecycle",
  id,
  "ben.visam",
];
export const useRoleLifeCycleById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRoleLifeCycleByIdKey(id),
    queryFn: () =>
      myAxios.get(`/user/role/${id}`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateRoleLifeCycle = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/life-cycle/add-role-life-cycle/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const usePutRoleLifeCycle = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ lifeCycleId, ...params }) => {
      return myAxios
        .put(`/life-cycle/update-role-life-cycle/${lifeCycleId}/`, params)
        .then((response) => {
          console.log(params);
          return response?.data;
        });
    },
  });
};
