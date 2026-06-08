import {useMutation, useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";


export const useProductPurchaseById = (id, construction = {}, personalityIds = [], queryOptions = {}) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["product-purchase", id, construction, personalityIds],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-list-purchases-by-id/${id}`, {
                        params: {
                            construction,
                            ...(personalityIds && {personality_ids: personalityIds})
                        }
                    })
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useConfirmProductPurchaseByIdKey = (id) => [
    "product-purchase-confirm",
    id,
];
export const useConfirmProductPurchaseById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useConfirmProductPurchaseByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-confirmed-product-purchases-by-id/${id}`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useUnConfirmProductPurchaseByIdKey = (id) => [
    "product-purchase-unconfirm",
    id,
    // type
];
export const useUnConfirmProductPurchaseById = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: useUnConfirmProductPurchaseByIdKey(id),
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-un-confirmed-product-purchases-by-id/${id}`)
                    .then((response) => response?.data)
                : Promise.resolve(null),
        ...queryOptions,
    });
};

export const useCreateProductPurchase = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-product-purchase/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useCreateProductPurchaseNumber = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .post(`/product/add-product-purchase-number/`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useDeleteProductPurchase = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: (params) => {
            return myAxios
                .delete(`/product/delete-product-purchase/${params}`)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};

export const useUpdateProductPurchase = () => {
    const {myAxios} = useMyAxios();
    return useMutation({
        mutationFn: ({productPurchaseId, ...params}) => {
            return myAxios
                .put(`/product/update-product-purchase/${productPurchaseId}`, params)
                .then((response) => {
                    return response?.data;
                });
        },
    });
};
//////////////////////////////////// AI //////////////////////////////////////
// Trigger zip creation → returns { uuid }
export const useCreatePurchaseZipReport = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (productId) =>
      myAxios
        .get(`/product/get-confirmed-product-purchases-list-zip-by-id/${productId}`)
        .then((res) => res.data),
  });
};

// Poll status by uuid
export const usePurchaseZipReportStatus = (uuid, { enabled } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["purchaseZipReportStatus", uuid],
    queryFn: () =>
      myAxios
        .get(`/product/get-confirmed-product-purchases-zip-status/${uuid}`)
        .then((res) => res.data),
    enabled: !!uuid && enabled,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 2_000,
    refetchIntervalInBackground: true,
  });
};
