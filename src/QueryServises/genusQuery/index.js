import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useGenusProductKey = ["lists", "genus"];
export const useGenusProductList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useGenusProductKey,
    queryFn: () =>
      myAxios.get(`/product/get-genus/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateGenusProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/product/add-genus/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

export const useDeleteGenusProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-genus/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateGenusProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ genusId, ...params }) => {
      return myAxios
        .put(`/product/update-genus/${genusId}/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
