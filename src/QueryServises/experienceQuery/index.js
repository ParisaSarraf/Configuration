import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const usExperienceListKey = ["list", "experience"];
export const usExperienceList = (queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: usExperienceListKey,
		queryFn: () =>
			myAxios.get(`/experience/get-experience/`).then((response) => {
				queryOptions?.onSuccess?.(response?.data);
				return response?.data;
			}),
		...queryOptions,
	});
};

export const useCreateExperience = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.post(`/product/add-experience/`, params)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useDeleteExperience = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (params) => {
			return myAxios
				.delete(`/Experience/delete-Experience/${params}`)
				.then((response) => {
					return response?.data;
				});
		},
	});
};

export const useUpdateExperience = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ ExperienceId, ...params }) => {
			return myAxios
				.put(`/experience/update-experience/${ExperienceId}`, params)
				.then((response) => response?.data);
		},
	});
};
