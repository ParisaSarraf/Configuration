import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useRolePermissionListKey = ["lists", "roles-permission"];
export const useRolePermissionList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRolePermissionListKey,
    queryFn: () =>
      myAxios.get(`/user/get-role-permissions/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useRolePermissionByIdKey = (id) => [
  "role-permission",
  id,
  "ben.visam",
];
export const useRolePermissionById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRolePermissionByIdKey(id),
    queryFn: () =>
      myAxios.get(`/user/get-role-permissions-by-id/${id}`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateRolePermission = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/user/add-role-permissions/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const usePutRolePermission = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ roleId, ...params }) => {
      return myAxios
        .put(`/user/update-role-permission/${roleId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
