import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useAvailableProductEditionListKey = (id) => [
	"product-edition-log",
	id,
];
export const useAvailableProductEditionList = (id, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useAvailableProductEditionListKey(id),
		queryFn: () =>
			id
				? myAxios
						.get(`/product/get-available-product-document-edition/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useProductDocumentEditionLogsBySerialIdListKey = (id) => [
	"product-document-edition-logs-serial",
	id,
];
export const useProductDocumentEditionLogsBySerialIdList = (
	id,
	queryOptions
) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useProductDocumentEditionLogsBySerialIdListKey(id),
		queryFn: () =>
			id
				? myAxios
						.get(`/product/get-available-product-document-edition/${id}/`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useCreateProductEditionlog = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.post(`/product/add-product-document-edition-log/`, params, {
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

export const useDeleteProductEditionlog = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/product/delete-product-document-edition-log/${params}`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateProductEditionlog = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ EditionLogId, ...params }) => {
			return myAxios
				.put(
					`/product/update-product-document-edition-log/${EditionLogId}`,
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

export const usePatchDocumentEditionLog = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ id, ...params }) =>
			myAxios
				.patch(`/product/change-product-document-edition-state/${id}`, params)
				.then((res) => res.data),
	});
};
