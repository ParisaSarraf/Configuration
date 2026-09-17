import { useMemo } from "react";
import { Alert, Empty, Skeleton } from "antd";
import { TableAntd } from "@/components/TableAntd/TableAntd";
import { useProcessRequests } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import Modal from "../../../components/Modal";
import processRequestColumns from "./processRequestColumns";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return value ? [value] : [];
};

const unwrapPayload = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return payload;
};

const processRequestRowsFromResponse = (payload, fallbackProcess) =>
  asArray(unwrapPayload(payload))
    .flatMap((process) => {
      const requests = asArray(process?.requests);
      return requests.map((request) => {
        const submission = request?.form_submission ?? null;
        const formData = submission?.form_data ?? null;
        return {
          rowKey: `process-${process?.id ?? fallbackProcess?.id ?? "unknown"}-request-${request?.id ?? "unknown"}`,
          source: "process-request",
          processId: process?.id ?? fallbackProcess?.id ?? null,
          processName: process?.name ?? fallbackProcess?.name ?? "",
          formDefinitionId: process?.form_definition ?? fallbackProcess?.form_definition ?? null,
          requestId: request?.id ?? null,
          title: request?.title ?? "",
          stateId: request?.current_state?.id ?? null,
          stateName: request?.current_state?.name ?? "",
          createdBy: request?.created_by ?? null,
          submissionId: submission?.id ?? null,
          formData,
          attachments: Array.isArray(submission?.file_attachments)
            ? submission.file_attachments
            : [],
          submitter: submission?.submitter ?? null,
          createdAt: request?.created_at ?? submission?.created_at ?? null,
          fieldCount: Object.keys(formData ?? {}).length,
        };
      });
    });

const ProcessRequestsModal = ({ open, process, onClose, onViewSubmission }) => {
  const processId = process?.id ?? null;
  const query = useProcessRequests(processId, {
    enabled: Boolean(open && processId),
  });

  const responseData = useMemo(() => unwrapPayload(query.data), [query.data]);

  const rows = useMemo(
    () => processRequestRowsFromResponse(responseData, process),
    [responseData, process],
  );

  const columns = useMemo(
    () =>
      processRequestColumns({
        page: 1,
        pageSize: Math.max(rows.length, 1),
        onView: onViewSubmission,
      }),
    [onViewSubmission, rows.length],
  );

  const title = `درخواست‌های ${process?.name || "فرآیند"}`;

  const renderBody = () => {
    if (!processId)
      return <Empty description="شناسهٔ فرآیند برای دریافت درخواست‌ها پیدا نشد." />;

    if (query.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

    if (query.isError)
      return (
        <Alert
          type="error"
          showIcon
          message="دریافت درخواست‌های فرآیند انجام نشد."
          description={getApiErrorMessage(query.error)}
        />
      );

    return (
      <TableAntd
        rowKey={(record) => record.rowKey}
        columns={columns}
        dataSource={rows}
        loading={query.isFetching}
        pagination={{ pageSize: 8 }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: <Empty description="برای این فرآیند درخواستی ثبت نشده است." />,
        }}
      />
    );
  };

  return (
    <Modal isOpen={open} title={title} onClose={onClose} footer={false} size={1200}>
      {renderBody()}
    </Modal>
  );
};

export default ProcessRequestsModal;
