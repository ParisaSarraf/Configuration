import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useContractorProductKey = ["lists", "Contractor"];
export const useContractorProductList = (queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useContractorProductKey,
		queryFn: () =>
			myAxios.get(`/product/contractor/`).then((response) => {
				queryOptions?.onSuccess?.(response?.data);
				return response?.data;
			}),
		...queryOptions,
	});
};

export const useCreateContractorProduct = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios.post(`/product/contractor/`, params).then((response) => {
				return response?.data;
			});
		},
	});
};

export const useDeleteContractorProduct = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/product/contractor/${params}/`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateContractorProduct = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ ContractorId, ...params }) => {
			return myAxios
				.put(`/product/contractor/${ContractorId}/`, params)
				.then((response) => {
					return response?.data;
				});
		},
	});
};
