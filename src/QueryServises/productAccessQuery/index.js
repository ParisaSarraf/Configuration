import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useProductAccsessKey = ["lists", "accsess-product"];
export const useProductAccsessList = (queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useProductAccsessKey,
		queryFn: () =>
			myAxios.get(`/product/get-accsess/`).then((response) => {
				queryOptions?.onSuccess?.(response?.data);
				return response?.data;
			}),
		...queryOptions,
	});
};

export const useGetAccessOfProductById = (id, queryOptions = {}) => {
	const myAxios = useMyAxios();
	return useQuery({
		queryKey: ["get-access-of-proudct-by-id-test", id],
		queryFn: () =>
			myAxios
				.get(`/get-access-of-proudct-by-id/${id}/`)
				.then((response) => response.data),
		...queryOptions,
	});
};

// export const useOneProductAccessKey = ["product", productId];
// export const useOneProductAccess = (productId) => {
//   return useQuery({
//     queryKey: useOneProductAccessKey,
//     queryFn: () =>
//       myAxios.get(`/product/get-access-by-id/${productId}`).then((response) => {
//         queryOptions?.onSuccess?.(response?.data);
//         return response?.data;
//       }),
//     ...queryOptions,
//   });
// };

export const useCreateProductAccess = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios.post(`/product/add-accsess/`, params).then((response) => {
				return response?.data;
			});
		},
	});
};

export const useDeleteProductAccess = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/product/delete-accsess/${params}/`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateProductAccess = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ productId, ...params }) => {
			return myAxios
				.put(`/product/update-accsess/${productId}/`, params)
				.then((response) => {
					return response?.data;
				});
		},
	});
};
