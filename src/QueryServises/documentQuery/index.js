import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useDocumentsListKey = ["list", "documents"];
export const useDocumentList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useDocumentsListKey,
    queryFn: () =>
      myAxios.get(`/document/get-document/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/document/add-document/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/document/delete-document/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateDocument = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ documentId, ...params }) => {
      return myAxios
        .put(`/document/update-document/${documentId}`, params)
        .then((response) => response?.data);
    },
  });
};
