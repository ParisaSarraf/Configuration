import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";
import { workflowApi } from "../../Services/workflow/workflowApi";
import { syncProcessGraph } from "../../Services/workflow/workflowPayloads";

export const processListKey = ["workflow", "processes"];
export const processInfoKey = (id) => ["workflow", "process", id];
export const processKpisKey = ["workflow", "process-kpis"];
export const processKpiKey = (id) => ["workflow", "process", id, "kpi"];
export const processStateReportKey = (id) => [
  "workflow",
  "process",
  id,
  "state-request-counts",
];
export const processStateDurationStatsKey = (id) => [
  "workflow",
  "process",
  id,
  "state-duration-stats",
];
export const transitionActionsKey = ["workflow", "transition-actions"];
export const requestsKey = ["workflow", "requests"];
export const requestKey = (id) => ["workflow", "request", id];
export const requestPathKey = (id) => ["workflow", "request", id, "path"];
export const requestsNeedActionKey = (filters = {}) => [
  "workflow",
  "requests",
  "need-action",
  filters.processId ?? null,
  filters.stateId ?? null,
];
export const processRequestsKey = (id, filters = {}) => [
  "workflow",
  "process-requests",
  id,
  filters.stateId ?? null,
  filters.stateType ?? "",
];
export const lockedFieldsByRequestKey = (id) => [
  "workflow",
  "request",
  id,
  "locked-fields",
];
export const lockedFieldsByProcessKey = (id) => [
  "workflow",
  "process",
  id,
  "locked-fields",
];

export const useProcessList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processListKey,
    queryFn: () => workflowApi.getProcesses(myAxios),
    ...queryOptions,
  });
};

export const useProcessInfo = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processInfoKey(id),
    queryFn: () => workflowApi.getProcessInfo(myAxios, id),
    enabled: Boolean(id),
    ...queryOptions,
  });
};

export const useProcessKpi = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processKpiKey(id),
    queryFn: () => workflowApi.getProcessKpi(myAxios, id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    ...queryOptions,
  });
};

export const useProcessKpis = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processKpisKey,
    queryFn: () => workflowApi.getProcessKpis(myAxios),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    ...queryOptions,
  });
};

export const useProcessStateRequestCounts = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processStateReportKey(id),
    queryFn: () => workflowApi.getProcessStateRequestCounts(myAxios, id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
};

export const useProcessStateDurationStats = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processStateDurationStatsKey(id),
    queryFn: () => workflowApi.getProcessStateDurationStats(myAxios, id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
};

export const useTransitionActions = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: transitionActionsKey,
    queryFn: () => workflowApi.getTransitionActions(myAxios),
    ...queryOptions,
  });
};

// ---------- درخواست‌های فرایند (Request) ----------
// منبع رسمی «ارسال‌شده‌ها»: هر درخواست شامل فرایند (و شناسهٔ فرم)،
// ایستگاه جاری و form_submission با مقادیر پرشدهٔ کاربر است.
export const useRequests = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: requestsKey,
    queryFn: () => workflowApi.getRequests(myAxios),
    ...queryOptions,
  });
};

export const useRequestById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: requestKey(id),
    queryFn: () => workflowApi.getRequestById(myAxios, id),
    enabled: Boolean(id),
    ...queryOptions,
  });
};

export const useRequestPathById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: requestPathKey(id),
    queryFn: () => workflowApi.getRequestPathById(myAxios, id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
};

export const useRequestsNeedUserAction = (filters = {}, queryOptions = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: requestsNeedActionKey(filters),
    queryFn: () => workflowApi.getRequestsNeedUserAction(myAxios, filters),
    ...queryOptions,
  });
};

export const useProcessRequests = (
  processId,
  filters = {},
  queryOptions = {},
) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: processRequestsKey(processId, filters),
    queryFn: () => workflowApi.getProcessRequests(myAxios, processId, filters),
    enabled: Boolean(processId),
    ...queryOptions,
  });
};

export const useLockedFieldsByRequestId = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: lockedFieldsByRequestKey(id),
    queryFn: () => workflowApi.getLockedFieldsByRequestId(myAxios, id),
    enabled: Boolean(id),
    ...queryOptions,
  });
};

export const useLockedFieldsByProcessId = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: lockedFieldsByProcessKey(id),
    queryFn: () => workflowApi.getLockedFieldsByProcessId(myAxios, id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
};

export const useCreateRequest = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => workflowApi.createRequest(myAxios, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestsKey });
      queryClient.invalidateQueries({
        queryKey: ["workflow", "requests", "need-action"],
      });
      queryClient.invalidateQueries({ queryKey: processKpisKey });
      if (variables?.process_id)
        queryClient.invalidateQueries({
          queryKey: processKpiKey(variables.process_id),
        });
    },
  });
};

export const useDoAction = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => workflowApi.doAction(myAxios, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestsKey });
      queryClient.invalidateQueries({
        queryKey: ["workflow", "requests", "need-action"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow", "process-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow", "process"],
      });
      queryClient.invalidateQueries({ queryKey: processKpisKey });
      if (variables?.request_id)
        queryClient.invalidateQueries({
          queryKey: requestPathKey(variables.request_id),
        });
    },
  });
};

export const useCreateProcess = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => workflowApi.createProcess(myAxios, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: processListKey }),
  });
};
export const useCreateProcessPermission = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      workflowApi.createProcessPermission(myAxios, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: processListKey }),
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

export const useUpdateProcessPermission = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ processId, ...payload }) =>
      workflowApi.updateProcessPermission(myAxios, processId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: processListKey });
      queryClient.invalidateQueries({
        queryKey: processInfoKey(variables.processId),
      });
    },
  });
};

export const useDeleteProcessPermission = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (processId) =>
      workflowApi.deleteProcessPermission(myAxios, processId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: processListKey }),
  });
};
export const useDeleteProcess = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (processId) => workflowApi.deleteProcess(myAxios, processId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: processListKey }),
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
      queryClient.invalidateQueries({
        queryKey: lockedFieldsByProcessKey(variables.processId),
      });
      queryClient.invalidateQueries({ queryKey: processListKey });
    },
  });
};
