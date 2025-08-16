import { useMutation } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

export const useChangePassword = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios.post(`/user/change_password/`, params).then((response) => {
        return response?.data;
      });
    },
  });
};
