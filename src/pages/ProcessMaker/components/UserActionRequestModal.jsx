import { Alert, Button, Skeleton } from "antd";
import { PartitionOutlined } from "@ant-design/icons";

import Modal from "../../../components/Modal";
import { useProcessRequests } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import {
  RequestWorkPanel,
  requestRowsFromResponse,
  statePresentation,
} from "./ProcessRequestsModal";

const UserActionRequestModal = ({ open, record, onClose, onCompleted }) => {
  // لیست نیازمند اقدام ممکن است فقط خلاصهٔ درخواست را داشته باشد و
  // current_state.transitions را برنگرداند. عملیات را از همان منبعی
  // بخوان که در «درخواست‌های جاری» استفاده می‌شود، نه از تعریف فرایند.
  const requestsQuery = useProcessRequests(record?.processId, {}, {
    enabled: Boolean(open && record?.processId && record?.requestId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  });
  const workRecord = requestRowsFromResponse(requestsQuery.data, {
    id: record?.processId,
    name: record?.processName,
    form_definition: record?.formDefinitionId,
  }).find(
    (item) =>
      String(item.requestId) === String(record?.requestId) &&
      String(item.processId) === String(record?.processId),
  );
  const displayedRecord = workRecord ?? record;
  const state = statePresentation(displayedRecord?.stateType);

  const renderWorkPanel = () => {
    if (!record) return null;
    if (!record.processId || !record.requestId)
      return (
        <Alert
          type="warning"
          showIcon
          message="شناسهٔ فرایند یا درخواست برای دریافت عملیات ارجاع در دسترس نیست."
        />
      );
    if (requestsQuery.isLoading || requestsQuery.isFetching)
      return <Skeleton active paragraph={{ rows: 8 }} />;
    if (requestsQuery.isError)
      return (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            requestsQuery.error,
            "دریافت جزئیات درخواست و عملیات ارجاع انجام نشد.",
          )}
          action={
            <Button onClick={() => requestsQuery.refetch()}>
              تلاش مجدد
            </Button>
          }
        />
      );
    if (!workRecord)
      return (
        <Alert
          type="warning"
          showIcon
          message="این درخواست در فهرست فعلی فرایند یافت نشد؛ فهرست نیازمند اقدام را تازه‌سازی کنید."
        />
      );
    return (
      <RequestWorkPanel
        key={`request-${workRecord.requestId}-state-${workRecord.currentStateId}`}
        record={workRecord}
        onCompleted={async () => {
          await onCompleted?.();
          onClose?.();
        }}
      />
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="100vw"
      className="request-workbench-modal"
      destroyOnClose
      footer={null}
      title={
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <PartitionOutlined className="text-blue-500" />
            {displayedRecord?.processName || "درخواست نیازمند اقدام"}
          </div>
          <div className="mt-1 text-xs font-normal text-slate-400">
            فرم مرحله فعلی را تکمیل و سپس عملیات ارجاع را انتخاب کنید.
          </div>
        </div>
      }
    >
      <div className={`mb-4 rounded-2xl border p-4 ${state.panel}`}>
        <div className="text-[11px] font-semibold opacity-70">
          این درخواست اکنون در مرحله
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <strong className="text-lg">
            {displayedRecord?.stateName || "بدون مرحله"}
          </strong>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-black/10">
            {state.label}
          </span>
        </div>
      </div>

      {renderWorkPanel()}
    </Modal>
  );
};

export default UserActionRequestModal;
