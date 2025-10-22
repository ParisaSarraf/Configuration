import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

export const useGetProductActivities = (productId, queryOptions) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: [
			"product",
			"activities",
			productId,
		],
		queryFn: () =>
			myAxios
				.get(`/product/get-product-activity-by-id/${productId}`)
				.then((response) => {
					queryOptions?.onSuccess?.(response?.data);
					return response?.data;
				}),
		...queryOptions,
	});
};

export const useGetProductActivitiesType = (
	productId,
	filters = {},
	queryOptions
) => {
	const { myAxios } = useMyAxios();
	return useQuery({
		queryKey: [
			"product",
			"activities-filter",
			productId,
			filters,
		],
		queryFn: () =>
			myAxios
				.get(`/product/get-product-activity-by-id/${productId}`, {
					params: {
						states : filters.states,
						internal: filters.internal || undefined,
						external: filters.external || undefined,
						...(filters.trustee_id?.length > 0 && {
							trustee_id: filters.trustee_id.join(","),
						}),
					},
				})
				.then((res) => {
					queryOptions?.onSuccess?.(res.data);
					return res.data;
				}),
		...queryOptions,
	});
};

export const useCreateActivity = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (activityData) => {
			return myAxios
				.post("/product/add-activity/", activityData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((response) => response?.data);
		},
	});
};

export const useUpdateActivity = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ activityId, ...activityData }) => {
			return myAxios
				.put(`/product/update-activity/${activityId}`, activityData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((response) => response?.data);
		},
	});
};

export const useDeleteActivity = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: (activityId) => {
			return myAxios
				.delete(`/product/delete-activity/${activityId}`)
				.then((response) => response?.data);
		},
	});
};

export const useChangeActivityTrustee = () => {
	const { myAxios } = useMyAxios();
	return useMutation({
		mutationFn: ({ trusteeId, trusteeData }) => {
			return myAxios.patch(
				`/product/change-activity-trustee/${trusteeId}`,
				trusteeData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
		},
	});
};

export const useChangePlanTrustee = () => {
	const { myAxios } = useMyAxios();

	return useMutation({
		mutationFn: ({ planId, trusteeData }) => {
			return myAxios.patch(
				`/product/change-plan-trustee/${planId}`,
				trusteeData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
		},
	});
};
