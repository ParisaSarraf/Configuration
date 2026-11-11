import { Alert, Button, Spin } from "antd";
import { useQueries } from "@tanstack/react-query";
import { useMyAxios } from "../../../hooks/useMyAxios";
import { useLogListKey } from "../../../QueryServises/LogQuery";
import WorkflowGraph from "../../../components/WorkflowGraph/WorkflowGraph";
import { orderWorkflowLogs, workflowLogsPath } from "../utils/workflowLogs";

// The API uses path parameters (id/state/model), not query-string parameters.
export function useRequirementWorkflowHistory(id, model, steps) {
  const { myAxios } = useMyAxios();
  const queries = useQueries({ queries: steps.map(({ value: state }) => ({
    queryKey: useLogListKey(id, model, state),
    enabled: id != null && id !== "",
    queryFn: async () => {
      const { data } = await myAxios.get(workflowLogsPath(id, state, model));
      if (!Array.isArray(data)) throw new Error("پاسخ تاریخچه معتبر نیست");
      return data;
    },
  })) });
  return {
    logs: orderWorkflowLogs(queries.map((query) => query.data)),
    isLoading: id != null && id !== "" && queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}

export function RequirementWorkflowHistory({ history, steps, currentState }) {
  return <div aria-label="تاریخچه روال">
    {history.isLoading && <div role="status"><Spin size="small" /> در حال دریافت تاریخچه روال...</div>}
    {history.isError && <Alert type="error" showIcon message="دریافت بخشی از تاریخچه روال ناموفق بود؛ تاریخچه ممکن است ناقص باشد."
      action={<Button size="small" onClick={history.refetch}>تلاش دوباره</Button>} />}
    {(!history.isLoading && !history.isError || history.logs.length > 0) &&
      <WorkflowGraph subject="الزام" steps={steps} currentState={currentState} logs={history.logs} />}
  </div>;
}
