import { useQuery } from "@tanstack/react-query";
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
