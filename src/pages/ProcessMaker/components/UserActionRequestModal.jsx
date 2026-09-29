import { PartitionOutlined } from "@ant-design/icons";

import Modal from "../../../components/Modal";
import { RequestWorkPanel, statePresentation } from "./ProcessRequestsModal";

const UserActionRequestModal = ({ open, record, onClose, onCompleted }) => {
  const state = statePresentation(record?.stateType);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="min(1380px, 98vw)"
      destroyOnClose
      footer={null}
      title={
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <PartitionOutlined className="text-blue-500" />
            {record?.processName || "درخواست نیازمند اقدام"}
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
            {record?.stateName || "بدون مرحله"}
          </strong>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-black/10">
            {state.label}
          </span>
        </div>
      </div>

      {record ? (
        <RequestWorkPanel
          record={record}
          onCompleted={async () => {
            await onCompleted?.();
            onClose?.();
          }}
        />
      ) : null}
    </Modal>
  );
};

export default UserActionRequestModal;
