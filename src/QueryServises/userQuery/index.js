import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";
export const useUserListKey = ["list", "users"];
export const useUserList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useUserListKey,
    queryFn: () =>
      myAxios.get(`/user/get-user/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateUser = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/user/add-user/`, params, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteUser = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/user/delete-user/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateUser = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ userId, ...params }) => {
      return myAxios
        .put(`/user/update-user/${userId}`, params, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          return response?.data;
        });
    },
  });
};
