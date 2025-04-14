import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const useAccessOfUserByIdKey = (id) => ["access-user", id];
export const useAccessOfUserByIdList = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useAccessOfUserByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/user/get-access-of-user-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useUnAccessOfUserByIdKey = (id) => ["unaccess-user", id];
export const useUnAccessOfUserByIdList = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useUnAccessOfUserByIdKey,
    queryFn: () =>
      id
        ? myAxios
            .get(`/user/get-unaccessed-products-by-user-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useUnAccessProductsByUserAndRoleId = (params) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["unaccess-products", params?.role_id, params?.user_id],
    queryFn: async () => {
      if (!params?.role_id || !params?.user_id) return null;

      try {
        const response = await myAxios.get(
          `/user/get-unaccessed-products-by-user-and-role/${params.user_id}/${params.role_id}`
        );
        return response.data;
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!params?.role_id && !!params?.user_id,
    retry: 1,
  });
};

export const useCreateAccessProducts = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/user/add-access-products/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteAccessProducts = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/user/delete-access/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
