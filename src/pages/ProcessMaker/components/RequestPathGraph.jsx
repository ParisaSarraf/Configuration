import { Alert, Empty, Skeleton } from "antd";
import { getApiErrorMessage } from "@/Services/forms/formUtils";

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const statePresentation = (state, isLast) => {
  const typeId = Number(state?.state_type?.id ?? state?.state_type_id);
  const typeName = normalize(state?.state_type?.name ?? state?.state_type);

  if (typeId === 2 || typeName === "start")
    return {
      label: "شروع",
      dotClass: "border-sky-500 bg-sky-500",
      labelClass: "text-sky-600",
    };
  if (typeId === 5 || ["denied", "rejected", "reject"].includes(typeName))
    return {
      label: "رد شده",
      dotClass: "border-rose-500 bg-rose-500",
      labelClass: "text-rose-600",
    };
  if (typeId === 1 || ["cancelled", "canceled", "cancel"].includes(typeName))
    return {
      label: "لغو شده",
      dotClass: "border-amber-500 bg-amber-500",
      labelClass: "text-amber-600",
    };
  if (typeId === 4 || ["complete", "completed", "done"].includes(typeName))
    return {
      label: "تکمیل شده",
      dotClass: "border-emerald-500 bg-emerald-500",
      labelClass: "text-emerald-600",
    };
  return {
    label: isLast ? "مرحله فعلی" : "انجام شده",
    dotClass: isLast
      ? "border-indigo-500 bg-white dark:bg-slate-900"
      : "border-slate-400 bg-slate-400",
    labelClass: isLast ? "text-indigo-600" : "text-slate-400",
  };
};

const RequestPathGraph = ({ query, requestId }) => {
  const states = asArray(query?.data);
  const processName = states[0]?.process?.name;

  return (
    <section className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800/50">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
            روند گردش
          </h3>
          <p className="mb-0 mt-1 text-xs text-slate-400">
            {states.length
              ? `${states.length.toLocaleString("fa-IR")} مرحله ثبت‌شده`
              : "سوابق حرکت درخواست"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {processName ? (
            <span className="max-w-56 truncate">{processName}</span>
          ) : null}
          {processName && requestId ? <span>·</span> : null}
          {requestId ? (
            <span>
              درخواست {requestId.toLocaleString?.("fa-IR") ?? requestId}
            </span>
          ) : null}
        </div>
      </div>

      {query?.isLoading || query?.isFetching ? (
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 2, width: ["85%", "55%"] }}
        />
      ) : query?.isError ? (
        <Alert
          type="error"
          showIcon
          message="روند درخواست دریافت نشد"
          description={getApiErrorMessage(query.error)}
        />
      ) : states.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="هنوز سابقه‌ای ثبت نشده است"
        />
      ) : (
        <div className="overflow-x-auto pb-1">
          <ol
            className="m-0 flex min-w-max list-none items-start p-0"
            aria-label="روند گردش درخواست"
            dir="rtl"
          >
            {states.map((state, index) => {
              const isLast = index === states.length - 1;
              const presentation = statePresentation(state, isLast);
              return (
                <li
                  key={`${state?.id ?? "state"}-${index}`}
                  className="flex items-start"
                >
                  <div className="w-36">
                    <div className="flex items-center">
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full border-2 ${presentation.dotClass} ${isLast ? "ring-4 ring-indigo-100 dark:ring-indigo-900/40" : ""}`}
                      />
                      {!isLast ? (
                        <span className="h-px w-[132px] bg-slate-200 dark:bg-slate-700" />
                      ) : null}
                    </div>
                    <div className="mt-3 pl-4">
                      <div className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {state?.name || `مرحله ${index + 1}`}
                      </div>
                      <div
                        className={`mt-1 text-[10px] font-medium ${presentation.labelClass}`}
                      >
                        {presentation.label}
                      </div>
                      {state?.description ? (
                        <p className="mb-0 mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">
                          {state.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
};

export default RequestPathGraph;
