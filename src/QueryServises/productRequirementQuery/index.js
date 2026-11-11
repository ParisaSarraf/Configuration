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
		placeholderData: undefined,
		enabled: id != null,
		queryFn: () =>
			id
				? myAxios
						.get(`/product/get-product-requirement-edition-tree/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useProductRequirementAcceptorKey = (id) => [
	"product-requirement-acceptor",
	id,
];
export const useProductRequirementAcceptor = (id, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useProductRequirementAcceptorKey(id),
		placeholderData: undefined,
		enabled: id != null,
		queryFn: () =>
			id != null
				? myAxios
						.get(`/product/get-product-requirement-acceptor/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useCreateProductRequirement = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.post(`/product/add-product-requirement/`, params)
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
				.post(`/product/add-product-requirement-exported/`, params)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateProductRequirementExported = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ productRequirementExportedId, formData }) => {
			return myAxios
				.put(
					`/product/update-product-requirement-exported/${productRequirementExportedId}`,
					formData,
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

export const useCreateProductRequirementEdition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (formData) => myAxios.post(
      "/product/add-product-requirment-edition/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    ).then((response) => response.data),
  });
};

// Workflow for an edition belonging to a non-imported requirement.
export const useChangeProductRequirementEditionState = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, state, comment }) =>
      myAxios.patch(`/product/change-state-product-requirement-edition/${id}`, { state, comment })
        .then((response) => response.data),
  });
};

// An imported edition progresses on the current product's assignment record.
export const useChangeExportedRequirementEditionState = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, state, comment }) =>
      myAxios.patch(`/product/change-product-requirement-edition-exported-state/${id}`, { state, comment })
        .then((response) => response.data),
  });
};
