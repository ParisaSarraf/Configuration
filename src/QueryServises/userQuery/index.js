import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useUserListKey = ["list", "users"];
export const useUserList = (queryOptions) => {
  const myAxios = useMyAxios();
  return useQuery({
    queryKey: useUserListKey,
    queryFn: () =>
      myAxios.get(`/user/get-user/`).then((response) => {
        console.log(`response :` , response);
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateUser = () => {
  const myAxios = useMyAxios();
  return useMutation((userData) =>
    myAxios.post(`/user/add-user/`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};

export const useDeleteUser = () => {
  const myAxios = useMyAxios();
  return useMutation((userId) => myAxios.delete(`/user/delete-user/${userId}`));
};

export const useUpdateUser = () => {
  const myAxios = useMyAxios();
  return useMutation(({ userId, userData }) =>
    myAxios.put(`/user/update-user/${userId}`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
