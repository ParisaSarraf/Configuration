import { useMutation } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

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
        .post(`/product/add-product-document-edition/`, params)
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
        .put(`/product/update-product-document-edition/${documentId}/`, params)
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
