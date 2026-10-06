import { useState } from "react";
import { Alert, Button, Empty, Skeleton, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useRequestStateHistoryById } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import Modal from "../../../components/Modal";

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const formatted = georgianDateTimeToJalaliDateTime(String(value));
  return formatted && !String(formatted).includes("Invalid") ? formatted : "—";
};

const formatNumber = (value) =>
  Math.max(0, Number(value) || 0).toLocaleString("fa-IR");

const formatDuration = (value) => {
  if (value == null || value === "") return "—";
  const raw = String(value).trim();
  const match = raw.match(/^(?:(\d+)\s+)?(\d+):(\d{2}):(\d{2})(?:\.\d+)?$/);
  if (!match) return raw;

  const [, days = "0", hours, minutes, seconds] = match;
  const parts = [];
  if (Number(days)) parts.push(`${formatNumber(days)} روز`);
  if (Number(hours)) parts.push(`${formatNumber(hours)} ساعت`);
  if (Number(minutes)) parts.push(`${formatNumber(minutes)} دقیقه`);
  if (Number(seconds) || !parts.length)
    parts.push(`${formatNumber(seconds)} ثانیه`);
  return parts.join(" و ");
};

const RequestStateHistoryButton = ({
  requestId,
  block = false,
  size,
  type = "default",
}) => {
  const [open, setOpen] = useState(false);
  const query = useRequestStateHistoryById(requestId, {
    enabled: Boolean(open && requestId),
    retry: false,
  });
  const rows = asArray(query.data);

  return (
    <>
      <Button
        block={block}
        size={size}
        type={type}
        icon={<HistoryOutlined />}
        disabled={!requestId}
        onClick={() => setOpen(true)}
      >
        گزارش زمانی درخواست
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">
              گزارش زمانی درخواست #{requestId ?? "—"}
            </div>
            <div className="mt-1 text-xs font-normal text-slate-400">
              مدت حضور درخواست در هر ایستگاه به ترتیب خط زمانی
            </div>
          </div>
        }
        size="min(760px, 96vw)"
        zIndex={1500}
        destroyOnClose
        footer={null}
      >
        {query.isLoading || query.isFetching ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : query.isError ? (
          <Alert
            type="error"
            showIcon
            message="دریافت گزارش زمانی درخواست انجام نشد"
            description={getApiErrorMessage(query.error)}
            action={
              <Button size="small" onClick={() => query.refetch()}>
                تلاش مجدد
              </Button>
            }
          />
        ) : rows.length ? (
          <ol className="m-0 list-none space-y-0 p-0">
            {rows.map((row, index) => {
              const isCurrent = !row?.exited_at;
              const isLast = index === rows.length - 1;
              return (
                <li
                  key={`${row?.state_id ?? row?.name ?? "state"}-${row?.entered_at ?? index}`}
                  className="grid grid-cols-[28px_minmax(0,1fr)] gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-950/40"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {isCurrent ? (
                        <ClockCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                    </span>
                    {!isLast ? (
                      <span className="min-h-10 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    ) : null}
                  </div>

                  <div className={`pb-4 ${isLast ? "" : "min-h-32"}`}>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <strong className="text-sm text-slate-800 dark:text-slate-100">
                            {row?.name || "ایستگاه بدون نام"}
                          </strong>
                          <div className="mt-1 text-[11px] text-slate-400">
                            مرحله {formatNumber(index + 1)}
                          </div>
                        </div>
                        <Tag
                          color={isCurrent ? "processing" : "success"}
                          className="m-0"
                        >
                          {isCurrent ? "مرحله فعلی" : "خارج‌شده"}
                        </Tag>
                      </div>

                      <div className="mt-4 rounded-xl bg-white p-3 dark:bg-slate-900">
                        <div className="text-[10px] text-slate-400">
                          مدت حضور
                        </div>
                        <div className="mt-1 text-base font-black text-indigo-600 dark:text-indigo-300">
                          {formatDuration(row?.duration)}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            زمان ورود
                          </div>
                          <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                            {formatDateTime(row?.entered_at)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">
                            زمان خروج
                          </div>
                          <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                            {isCurrent
                              ? "هنوز در این ایستگاه است"
                              : formatDateTime(row?.exited_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <Empty description="هنوز سابقه زمانی برای این درخواست ثبت نشده است" />
        )}
      </Modal>
    </>
  );
};

export default RequestStateHistoryButton;