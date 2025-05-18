import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useProductSerialListKey = ["list", "product-serial"];
export const useProductSerialList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductSerialListKey,
    queryFn: () =>
      myAxios.get(`/product/add-product-serial/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useProductSerialByIdKey = (id) => ["product-serial", id];
export const useProductSerialById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductSerialByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-serial-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};
