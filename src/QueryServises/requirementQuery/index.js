import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

export const useRequirementListKey = ["list", "requirement"];
export const useRequirementList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useRequirementListKey,
    queryFn: () =>
      myAxios.get(`/product/add-requirement-tree/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};
