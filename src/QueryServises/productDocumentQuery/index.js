import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

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
          },
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
              `/product/get-product-document-edition-logs-by-serial-id/${id}`,
            )
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useGetZipByIdKey = (id) => ["product-document-zip", id];
export const useGetZipById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useGetZipByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-documnet-zip-report-by-id/${id}`, {
              responseType: "blob",
            })
            .then((response) => response.data)
        : Promise.resolve(null),
    enabled: false,
    ...queryOptions,
  });
};

// AI
// Trigger zip creation → returns { uuid }
export const useCreateZipReport = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (productId) =>
      myAxios
        .get(`/product/get-product-documnet-zip-report-by-id/${productId}`)
        .then((res) => res.data),
  });
};

// zip by serial id
export const useCreateZipReportBySerialId = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (productId) =>
      myAxios
        .get(
          `/product/get-product-document-edition-logs-zip-by-serial-id/${productId}`,
        )
        .then((res) => res.data),
  });
};

// Poll status by uuid77yg
export const useZipReportStatus = (uuid, { enabled } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["zipReportStatus", uuid],
    queryFn: () =>
      myAxios
        .get(
          `/product/get-product-documnet-zip-report-status-by-uuid-id/${uuid}`,
        )
        .then((res) => res.data),
    enabled: !!uuid && enabled,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 2_000,
    refetchIntervalInBackground: true,
  });
};

export const useZipSerialReportStatusBySerialId = (uuid, { enabled } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["zipSerialReportStatusBySerialId", uuid],
    queryFn: () =>
      myAxios
        .get(`/product/get-product-document-edition-logs-zip-by-status/${uuid}`)
        .then((res) => res.data),
    enabled: !!uuid && enabled,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 2_000,
    refetchIntervalInBackground: true,
  });
};

export const useExportExcelSerial = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) =>
      myAxios
        .get(
          `/product/get-product-document-edition-logs-csv-by-serial-id/${id}`,
          {
            responseType: "blob",
          },
        )
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "text/csv;charset=utf-8;",
          });
          return window.URL.createObjectURL(blob);
        }),
  });
};
