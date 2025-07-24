import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useUsersRoleListKey = ["lists", "users&roles"];
export const useUsersRoleList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useUsersRoleListKey,
    queryFn: () =>
      myAxios.get(`/user/get-role-users/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateUsersRoles = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/user/add-role-user/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

// export const useDeleteRole = () => {
//   const { myAxios } = useMyAxios();
//   return useMutation({
//     mutationFn: (params) => {
//       return myAxios.delete(`/user/role/${params}/`).then((response) => {
//         return response?.data;
//       });
//     },
//   });
// };

export const usePutUsersRole = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ roleId }) => {
      return myAxios
        .put(`/user/update-role-users/${roleId}`, {
          role_id: roleId,
        })
        .then((response) => {
          return response?.data;
        });
    },
    onSuccess: () => {
      message.success("نقش کاربر با موفقیت به‌روزرسانی شد!");
    },
    onError: () => {
      message.error("خطا در به‌روزرسانی نقش کاربر!");
    },
  });
};

// export const usePatchRole = () => {
//   const { myAxios } = useMyAxios();
//   return useMutation({
//     mutationFn: ({ roleId, ...params }) => {
//       return myAxios.patch(`/user/role/${roleId}/`, params).then((response) => {
//         return response?.data;
//       });
//     },
//     onSuccess: (data) => {
//       console.log("Update successful:", data);
//     },
//     onError: (error) => {
//       console.error("Update failed:", error);
//     },
//   });
// };
