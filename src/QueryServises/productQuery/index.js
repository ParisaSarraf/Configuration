import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

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

export const useRootProductKey = ["root", "product"];
export const useRootProduct = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRootProductKey,
    queryFn: () =>
      myAxios.get(`/product/get-root-products/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useChildProductByIdKey = (parentId) => ["child", "product", parentId];
export const useChildProductById = (parentId, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useChildProductByIdKey(parentId),
    queryFn: () =>
      parentId
        ? myAxios
            .get(`/product/get-product-child-by-id/${parentId}`)
            .then((response) => response?.data)
        : Promise.resolve([]),
    enabled: !!parentId,
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

export const useProductChildrenKey = (id) => ["product-children", id];
export const useProductChildren = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useProductChildrenKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-children-by-id/${id}/`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useFinalCodeProductByIdKey = (id) => ["product-parent-code", id];
export const useFinalCodeProductById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useFinalCodeProductByIdKey(id),
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return myAxios
        .get(`/product/get-product-parents-code/${id}`)
        .then((response) => {
          return response?.data;
        });
    },
    ...queryOptions,
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

export const useDeleteProductImage = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .patch(`/product/delete-product-image/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (v?.value !== undefined) {
          formData.append(`${key}[]`, v.value);
        } else {
          formData.append(`${key}[]`, v);
        }
      });
    } else if (val && typeof val === "object" && "value" in val) {
      formData.append(key, val.value);
    } else if (val !== undefined && val !== null) {
      formData.append(key, val);
    }
  });

  return formData;
};

export const useCreateProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      const formData = createFormData(params);
      return myAxios
        .post(`/product/add-product/`, formData, {
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

export const useHideProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, hide }) => {
      return myAxios
        .patch(`/product/hide-product-from-root-tree/${id}/`, { hide })
        .then((res) => res.data);
    },
  });
};

export const useUpdateProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productId, ...params }) => {
      const formData = createFormData(params);

      return myAxios
        .put(`/product/update-product/${productId}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res?.data);
    },
  });
};

export const useUpdateProductInfo = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productId, ...ProductInfoData }) => {
      const formData = new FormData();
      Object.keys(ProductInfoData).forEach((key) => {
        const value = ProductInfoData[key];
        if (value === null) {
          formData.append(key, "null");
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value ?? "");
        }
      });
      return myAxios
        .patch(`/product/patch-user-info/${productId}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          return response?.data;
        })
        .catch((error) => {
          console.error("API Error:", error.response?.data);
          throw error;
        });
    },
  });
};
