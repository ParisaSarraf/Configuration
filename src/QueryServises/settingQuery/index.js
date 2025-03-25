import { useMyAxios } from "../../utils/Api";

export const coreSettingsQueryKeys = {
  all: ["core-settings"],
  lists: () => [...coreSettingsQueryKeys.all, "list"],
  list: (filters) => [...coreSettingsQueryKeys.lists(), { filters }],
  details: () => [...coreSettingsQueryKeys.all, "detail"],
  detail: (id) => [...coreSettingsQueryKeys.details(), id],
  deleted: () => [...coreSettingsQueryKeys.all, "deleted"],
};

export const useCoreSettingsList = (options = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: coreSettingsQueryKeys.list(),
    queryFn: () =>
      myAxios.get("/core/setting/").then((res) => {
        options.onSuccess?.(res.data);
        return res.data;
      }),
    ...options,
  });
};

export const useCoreSettingDetails = (id, options = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: coreSettingsQueryKeys.detail(id),
    queryFn: () =>
      myAxios.get(`/core/setting/${id}`).then((res) => {
        options.onSuccess?.(res.data);
        return res.data;
      }),
    ...options,
  });
};

export const useDeletedCoreSettings = (options = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: coreSettingsQueryKeys.deleted(),
    queryFn: () =>
      myAxios.get("/core/setting/deleted/").then((res) => {
        options.onSuccess?.(res.data);
        return res.data;
      }),
    ...options,
  });
};

export const useCreateCoreSetting = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (newData) =>
      myAxios.post("/core/setting/", newData).then((res) => res.data),
  });
};

export const useUpdateCoreSetting = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, ...updateData }) =>
      myAxios.put(`/core/setting/${id}`, updateData).then((res) => res.data),
  });
};

export const usePatchCoreSetting = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, ...partialData }) =>
      myAxios.patch(`/core/setting/${id}`, partialData).then((res) => res.data),
  });
};

export const useDeleteCoreSetting = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) =>
      myAxios.delete(`/core/setting/${id}`).then((res) => res.data),
  });
};

export const useRestoreCoreSetting = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) =>
      myAxios.post(`/core/setting/${id}/restore/`).then((res) => res.data),
  });
};
