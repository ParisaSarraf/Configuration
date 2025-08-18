import { useQuery } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

export const usePermissionListKey = ["lists", "permission"];
export const usePermissionList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: usePermissionListKey,
    queryFn: () =>
      myAxios.get(`/user/get-permissions/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};
