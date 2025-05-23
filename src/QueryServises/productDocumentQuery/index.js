import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useCreateProductDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/product/add-product-document/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useCreateProductDocumentEdition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/product/add-product-document-edition/`, params, {
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

export const useDeleteProductDocumentEdition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-product-document-edition/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteProductDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/product/delete-product-document/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProductDocumentEdition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ documentId, ...params }) => {
      return myAxios
        .put(
          `/product/update-product-document-edition/${documentId}/`,
          params,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => response?.data);
    },
  });
};

export const useUpdateProductDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ documentId, ...params }) => {
      return myAxios
        .put(`/product/update-product-document/${documentId}/`, params)
        .then((response) => response?.data);
    },
  });
};

export const useProductDocumentTreeByIdKey = (id) => [
  "product-document-tree",
  id,
];
export const useProductDocumentTreeById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductDocumentTreeByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-document-tree/${id}/`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useProductDocumentEditionLogsBySerialByIdKey = (id) => [
  "product-document-edition-log-by-serial-id",
  id,
];
export const useProductDocumentEditionLogsBySerialById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductDocumentEditionLogsBySerialByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(
              `/product/get-product-document-edition-logs-by-serial-id/${id}`
            )
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};
