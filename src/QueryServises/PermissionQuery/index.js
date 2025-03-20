import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../utils/Api";

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
