import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";
import { workflowApi } from "../../Services/workflow/workflowApi";
import { syncProcessGraph } from "../../Services/workflow/workflowPayloads";

export const processListKey = ["workflow", "processes"];
export const processInfoKey = (id) => ["workflow", "process", id];
export const transitionActionsKey = ["workflow", "transition-actions"];

export const useProcessList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processListKey,
    queryFn: () => workflowApi.getProcesses(myAxios),
    ...queryOptions,
  });
};

// پاسخ get-process-info-by-id به صورت آرایه (many=True) برگردانده می‌شود.
export const useProcessInfo = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processInfoKey(id),
    queryFn: () => workflowApi.getProcessInfo(myAxios, id),
    enabled: Boolean(id),
    ...queryOptions,
  });
};

// اتصال عملیات‌ها به ارتباط‌ها در پاسخ get-process-info-by-id نیست و از این API خوانده می‌شود.
export const useTransitionActions = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: transitionActionsKey,
    queryFn: () => workflowApi.getTransitionActions(myAxios),
    ...queryOptions,
  });
};

export const useCreateProcess = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => workflowApi.createProcess(myAxios, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: processListKey }),
  });
};

export const useUpdateProcess = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ processId, ...payload }) =>
      workflowApi.updateProcess(myAxios, processId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: processListKey });
      queryClient.invalidateQueries({
        queryKey: processInfoKey(variables.processId),
      });
    },
  });
};

export const useDeleteProcess = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (processId) => workflowApi.deleteProcess(myAxios, processId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: processListKey }),
  });
};

// ذخیره‌ی نمودار: plan محاسبه‌شده را روی APIهای واقعی workflow اجرا می‌کند.
export const useSaveProcessGraph = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ processId, plan }) =>
      syncProcessGraph(myAxios, { processId, plan }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: processInfoKey(variables.processId),
      });
      queryClient.invalidateQueries({ queryKey: transitionActionsKey });
      queryClient.invalidateQueries({ queryKey: processListKey });
    },
  });
};
