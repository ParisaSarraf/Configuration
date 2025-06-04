import { useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useProductPurchaseByIdKey = (id) => ["product-purchase", id];
export const useProductPurchaseById = (id, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useProductPurchaseByIdKey(id),
		queryFn: () =>
			id
				? myAxios
						.get(`/product/get-product-purchases-by-id/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};
