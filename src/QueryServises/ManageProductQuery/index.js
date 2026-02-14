
import { useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useRootProductKey = ["root", "product"];
export const useRootProduct = (params, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: [...useRootProductKey, params], 
    queryFn: () =>
      myAxios
        .get(`/product/get-root-products/`, { params })
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    ...queryOptions,
  });
};

export const useChildProductByIdKey = (parentId) => ["child", "product", parentId];
export const useChildProductById = (parentId) => {
    const { myAxios } = useMyAxios();
    const fetchChild = async (id, params) => {
        const response = await myAxios.get(`/product/get-product-child-by-id/${id}`, { params });
        return response.data;
    }
    return { fetchChild };
};