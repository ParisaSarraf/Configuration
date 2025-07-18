import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useStandardCodeKey = ["lists", "standard-code"];
export const useStandardCodeList = (queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useStandardCodeKey,
		queryFn: () =>
			myAxios.get(`/core/standard-code/`).then((response) => {
				queryOptions?.onSuccess?.(response?.data);
				return response?.data;
			}),
		...queryOptions,
	});
};

export const useStandardCodePersonalityByIdKey = (id) => ["personality-id", id];
export const useStandardCodePersonalityById = (id, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: useStandardCodePersonalityByIdKey(id),
		queryFn: () =>
			id
				? myAxios
						.get(`/core/get-personality-by-id/${id}`)
						.then((response) => response?.data)
				: Promise.resolve(null),
		...queryOptions,
	});
};

export const useCreateStandardCode = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios.post(`/core/standard-code/`, params).then((response) => {
				return response?.data;
			});
		},
	});
};

export const useDeleteStandardCode = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/core/standard-code/${params}/`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateStandardCode = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ StandardCodeId, ...params }) => {
			return myAxios
				.put(`/core/standard-code/${StandardCodeId}/`, params)
				.then((response) => {
					return response?.data;
				});
		},
	});
};
