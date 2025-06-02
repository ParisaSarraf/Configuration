import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useProductRequirementListKey = (id) => [
	"product-requirement-tree",
	id,
];
export const useProductRequirementList = (id, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useProductRequirementListKey(id),
		queryFn: () =>
			id
				? myAxios
						.get(`/product/get-product-requirement-tree/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useCreatepRroductRequirement = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.post(`/product/add-product-requirement/`, params, {
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

export const useUpdateProductRequirement = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ productRequirementId, ...params }) => {
			return myAxios
				.put(
					`/product/update-product-requirement/${productRequirementId}`,
					params,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useDeleteProductRequirement = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/product/delete-product-requirement/${params}`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useCreatepProductRequirementExported = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.post(`/product/add-product-requirement-exported/`, params, {
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

export const useUpdateProductRequirementExported = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ productRequirementExportedId, ...params }) => {
			return myAxios
				.put(
					`/product/update-product-requirement-exported/${productRequirementExportedId}`,
					params,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				)
				.then((response) => {
					return response?.data;
				});
		},
	});
};
