import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useRoleListKey = ["lists", "roles"];
export const useRoleList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRoleListKey,
    queryFn: () =>
      myAxios.get(`/user/role/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useRoleKey = (id) => ["role", id];
export const useRole = (queryOptions, params) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRoleKey(params?.id),
    queryFn: () =>
      myAxios.get(`/user/role/${params?.id}/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data?.[0]);
        return response?.data?.[0];
      }),
  });
};

export const useCreateRole = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/user/role/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

export const useDeleteRole = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.delete(`/user/role/${params}/`).then((response) => {
        return response?.data;
      });
    },
  });
};

export const usePutRole = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ roleId, ...params }) => {
      return myAxios
        .put(
          `/user/role/${roleId}/`,
          params
          //   , {
          //   headers: {
          //     "Content-Type": "multipart/form-data",
          //   },
          // }
        )
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const usePatchRole = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ roleId, ...params }) => {
      return myAxios.patch(`/user/role/${roleId}/`, params).then((response) => {
        return response?.data;
      });
    },
    onSuccess: (data) => {
      console.log("Update successful:", data);
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
};
