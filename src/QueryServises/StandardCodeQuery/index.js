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

export const useStandardCodePersonalityByIdKey = (id, name, description) => [
  "personality-id",
  id,
  name,
  description,
];
export const useStandardCodePersonalityById = (
  id,
  name,
  description,
  queryOptions = {},
) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useStandardCodePersonalityByIdKey(id, name, description),
    queryFn: async () => {
      const response = await myAxios.get(`/core/get-personality-by-id/${id}`, {
        params: {
          ...(name && { name }),
          ...(description && { description }),
        },
      });
      return response?.data;
    },
    enabled: !!id,
    ...queryOptions,
  });
};

export const useCreateStandardCode = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/core/standard-code/`, params, {
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
        .put(`/core/standard-code/${StandardCodeId}/`, params, {
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
