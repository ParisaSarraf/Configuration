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
            .get(`/product/get-product-serials-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useCreateProductSerial = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/product/add-product-serial/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProductSerial = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ ProductSerialId, ...params }) => {
      return myAxios
        .put(`/product/update-product-serial/${ProductSerialId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteProductSerial = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-product-serial/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useProductSerialChildrenByIdKey = (id) => [
  "product-serial-children",
  id,
];
export const useProductSerialChildrenById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductSerialChildrenByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-serial-childrens-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useProductSerialUnlinkedByIdKey = (id) => [
  "product-serial-children",
  id,
];
export const useProductSerialUnlinkedById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductSerialUnlinkedByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-unlinked-serials/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};
