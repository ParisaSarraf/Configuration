import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

export const usePrecinctProductKey = ["lists", "precinct"];
export const usePrecinctProductList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: usePrecinctProductKey,
    queryFn: () =>
      myAxios.get(`/product/get-precinct/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreatePrecinctProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/product/add-precinct/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

export const useDeletePrecinctProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-precinct/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdatePrecinctProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ precinctId, ...params }) => {
      return myAxios
        .put(`/product/update-precinct/${precinctId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
