import { useMutation } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

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
