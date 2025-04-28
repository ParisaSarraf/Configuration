import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const usePersonalityProductKey = ["lists", "personality"];
export const usePersonalityProductList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: usePersonalityProductKey,
    queryFn: () =>
      myAxios.get(`/core/get-personality/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreatePersonalityProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/core/add-personality/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};

export const useDeletePersonalityProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/core/delete-personality/${params}/`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdatePesonalityProduct = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ personalityId, ...params }) => {
      return myAxios
        .put(`/core/update-personality/${personalityId}/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
