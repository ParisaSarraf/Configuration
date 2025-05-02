import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useProductKey = ["lists", "product"];
export const useProductList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductKey,
    queryFn: () =>
      myAxios.get(`/product/get-product/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useProductByIdKey = (id) => ["product", id];
export const useProductById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useCreateProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/product/add-product/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

export const useDeleteProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-product/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productId, ...params }) => {
      
      return myAxios
        .put(`/product/update-product/${productId}/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
