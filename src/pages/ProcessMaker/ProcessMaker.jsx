import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Empty, Input, Segmented, Select, Tooltip } from "antd";
import {
  ArrowRightOutlined,
  InboxOutlined,
  PartitionOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Header from "@/components/Layouts/Header.jsx";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { getUserFromToken } from "@/utils/ExportFromToken";
import CartableTaskModal from "./components/CartableTaskModal";
import CartableSubmissionModal from "./components/CartableSubmissionModal";
import { TableAntd } from "../../components/TableAntd/TableAntd";
import todoColumns from "./components/todoColumns";
import sentColumns from "./components/sentColumns";
import processColumns from "./components/processColumns";
import ProcessRequestsModal from "./components/ProcessRequestsModal";
import { requestRowsFromResponse } from "./components/ProcessRequestsModal";
import ProcessPathModal from "./components/ProcessPathModal";
import UserActionRequestModal from "./components/UserActionRequestModal";
import userActionColumns from "./components/userActionColumns";
import { useFormSubmisions } from "../../QueryServises/formsQuery";
import {
  useProcessInfo,
  useProcessList,
  useRequests,
  useRequestsNeedUserAction,
} from "../../QueryServises/workflowQuery";
import {
  sentRowsFromRequests,
  sentRowsFromSubmissions,
} from "@/Services/forms/submissionView";
import useModal from "../../hooks/useModal";

const PAGE_SIZE = 8;

const TABS = Object.freeze({
  TODO: "todo",
  SENT: "sent",
  PROCESSES: "processes",
  ACTIONS: "actions",
});

const MODAL_TYPES = Object.freeze({
  CARTABLE_TASK: "cartableTask",
  CARTABLE_SUBMISSION: "cartableSubmission",
  PROCESS_REQUESTS: "processRequests",
  PROCESS_PATH: "processPath",
  USER_ACTION: "userAction",
});

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const normalize = (value) =>
  String(value ?? "")
    .replace(/[\u064A\u0649]/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/\u200C/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const readCurrentUser = () => {
  const user = getUserFromToken();
  return {
    id: user?.user_id ?? user?.id ?? null,
    name: user?.displayName || "کاربر",
  };
};

const ProcessMakerCartable = () => {
  const navigate = useNavigate();
  const { isOpen, modalType, modalData, setModal, closeModal } = useModal();

  const currentUser = useMemo(readCurrentUser, []);

  const [tab, setTab] = useState(TABS.TODO);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionProcessId, setActionProcessId] = useState(null);
  const [actionStateId, setActionStateId] = useState(null);

  const actionTabIsVisible = tab === TABS.ACTIONS;
  const processTabIsVisible =
    tab === TABS.TODO || tab === TABS.PROCESSES || actionTabIsVisible;
  const sentTabIsVisible = tab === TABS.SENT;
  const permissionSensitiveQueryOptions = {
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  // فقط APIهای مورد نیاز تب فعال اجرا می‌شوند؛ قبلاً هر سه درخواست با هم
  // اجرا و هر خطای 403 نیز چند بار retry می‌شد.
  const processListQuery = useProcessList({
    ...permissionSensitiveQueryOptions,
    enabled: processTabIsVisible,
  });
  const formSubmissionQuery = useFormSubmisions({
    ...permissionSensitiveQueryOptions,
    enabled: sentTabIsVisible,
  });
  const requestsQuery = useRequests({
    ...permissionSensitiveQueryOptions,
    enabled: sentTabIsVisible,
  });
  const actionFilters = useMemo(
    () => ({
      processId: actionProcessId,
      stateId: actionStateId,
    }),
    [actionProcessId, actionStateId],
  );
  const userActionsQuery = useRequestsNeedUserAction(actionFilters, {
    ...permissionSensitiveQueryOptions,
    enabled: actionTabIsVisible,
  });
  const actionProcessInfoQuery = useProcessInfo(actionProcessId, {
    ...permissionSensitiveQueryOptions,
    enabled: Boolean(actionTabIsVisible && actionProcessId),
  });

  useEffect(() => {
    setPage(1);
  }, [actionProcessId, actionStateId, search, tab]);

  useEffect(() => {
    if (tab !== TABS.ACTIONS) return;
    setActionStateId(null);
  }, [actionProcessId, tab]);

  // ---------- فرایندهای قابل شروع (TODO) ----------
  // دیتای تب «درخواست ها» از API فرایند خوانده می‌شود، نه لیست فرم‌ها.
  // هر رکورد process در CartableTaskModal به فرم مرتبطش resolve می‌شود.
  const processes = useMemo(
    () => asArray(processListQuery.data),
    [processListQuery.data],
  );

  const todoItems = processes;

  const filteredTodo = useMemo(() => {
    const term = normalize(search);
    if (!term) return todoItems;
    return todoItems.filter(
      (item) =>
        normalize(item?.name).includes(term) ||
        normalize(item?.description).includes(term) ||
        normalize(item?.form_definition?.name).includes(term) ||
        normalize(item?.form_definition?.description).includes(term),
    );
  }, [todoItems, search]);

  // ---------- ارسال‌شده‌ها (SENT) ----------
  const requestRows = useMemo(
    () => sentRowsFromRequests(requestsQuery.data),
    [requestsQuery.data],
  );

  const legacyRows = useMemo(
    () =>
      sentRowsFromSubmissions(
        formSubmissionQuery.data,
        new Set(requestRows.map((row) => row.submissionId).filter(Boolean)),
      ),
    [formSubmissionQuery.data, requestRows],
  );

  const sentRows = useMemo(
    () => [...requestRows, ...legacyRows],
    [requestRows, legacyRows],
  );

  const filteredSent = useMemo(() => {
    const term = normalize(search);
    if (!term) return sentRows;
    return sentRows.filter((row) => {
      const values = Object.values(row?.formData ?? {})
        .map((value) =>
          value && typeof value === "object" ? JSON.stringify(value) : value,
        )
        .join(" ");
      return (
        normalize(row?.submitter?.name).includes(term) ||
        normalize(row?.submitter?.username).includes(term) ||
        normalize(row?.processName).includes(term) ||
        normalize(row?.stateName).includes(term) ||
        normalize(row?.title).includes(term) ||
        normalize(values).includes(term)
      );
    });
  }, [sentRows, search]);

  // ---------- لیست فرآیندها (PROCESSES) ----------
  const filteredProcesses = useMemo(() => {
    const term = normalize(search);
    if (!term) return processes;
    return processes.filter(
      (item) =>
        normalize(item?.name).includes(term) ||
        normalize(item?.description).includes(term) ||
        normalize(item?.form_definition?.name).includes(term),
    );
  }, [processes, search]);

  // ---------- درخواست‌های نیازمند اقدام کاربر ----------
  const actionRows = useMemo(
    () => requestRowsFromResponse(userActionsQuery.data),
    [userActionsQuery.data],
  );
  const filteredActionRows = useMemo(() => {
    const term = normalize(search);
    if (!term) return actionRows;
    return actionRows.filter(
      (row) =>
        normalize(row.processName).includes(term) ||
        normalize(row.title).includes(term) ||
        normalize(row.stateName).includes(term),
    );
  }, [actionRows, search]);
  const selectedActionProcess = useMemo(
    () =>
      asArray(actionProcessInfoQuery.data)[0] ??
      (actionProcessInfoQuery.data &&
      !Array.isArray(actionProcessInfoQuery.data)
        ? actionProcessInfoQuery.data
        : null),
    [actionProcessInfoQuery.data],
  );
  const actionStateOptions = useMemo(() => {
    const processStates = asArray(selectedActionProcess?.process_states);
    if (processStates.length)
      return processStates.map((state) => ({
        value: state.id,
        label: state.name || `مرحله ${state.id}`,
      }));
    const seen = new Set();
    return actionRows.flatMap((row) => {
      if (!row.currentStateId || seen.has(String(row.currentStateId)))
        return [];
      seen.add(String(row.currentStateId));
      return [
        {
          value: row.currentStateId,
          label: row.stateName || `مرحله ${row.currentStateId}`,
        },
      ];
    });
  }, [actionRows, selectedActionProcess]);

  // ---------- مودا��‌ها ----------
  const openTaskModal = (record) => {
    setModal({
      type: MODAL_TYPES.CARTABLE_TASK,
      mode: "add",
      data: record,
    });
  };

  const openSubmissionModal = (record) => {
    setModal({
      type: MODAL_TYPES.CARTABLE_SUBMISSION,
      mode: "view",
      data: record,
    });
  };

  const openProcessRequestsModal = (record) => {
    setModal({
      type: MODAL_TYPES.PROCESS_REQUESTS,
      mode: "view",
      data: record,
    });
  };

  const openProcessPathModal = (record) => {
    setModal({
      type: MODAL_TYPES.PROCESS_PATH,
      mode: "view",
      data: record,
    });
  };

  const openUserActionModal = (record) => {
    setModal({
      type: MODAL_TYPES.USER_ACTION,
      mode: "edit",
      data: record,
    });
  };

  const closeProcessRequestsModal = () => {
    closeModal();
  };

  const handleSubmitted = () => {
    requestsQuery.refetch();
    formSubmissionQuery.refetch();
    setTab(TABS.PROCESSES);
  };

  // ---------- ستون‌ها ----------
  const isTodo = tab === TABS.TODO;
  const isSent = tab === TABS.SENT;
  const isProcesses = tab === TABS.PROCESSES;
  const isActions = tab === TABS.ACTIONS;
  const dataSource =
    (isTodo
      ? filteredTodo
      : isSent
        ? filteredSent
        : isActions
          ? filteredActionRows
          : filteredProcesses) || [];

  const todoCols = useMemo(
    () =>
      todoColumns({
        page,
        setActiveProcess: openTaskModal,
        onViewPath: openProcessPathModal,
        pageSize: PAGE_SIZE,
      }),
    [page],
  );

  const sentCols = useMemo(
    () =>
      sentColumns({
        page,
        pageSize: PAGE_SIZE,
        onView: openSubmissionModal,
      }),
    [page],
  );

  const processCols = useMemo(
    () =>
      processColumns({
        page,
        pageSize: PAGE_SIZE,
        onViewRequests: openProcessRequestsModal,
        onViewPath: openProcessPathModal,
      }),
    [page],
  );

  const actionCols = useMemo(
    () =>
      userActionColumns({
        page,
        pageSize: PAGE_SIZE,
        onComplete: openUserActionModal,
      }),
    [page],
  );

  // ---------- رفرش دستی ----------
  const handleRefresh = () => {
    if (isTodo) {
      processListQuery.refetch();
    } else if (isSent) {
      requestsQuery.refetch();
      formSubmissionQuery.refetch();
    } else if (isActions) {
      userActionsQuery.refetch();
    } else {
      processListQuery.refetch();
    }
  };

  const isRefreshing = isTodo
    ? processListQuery.isFetching
    : isSent
      ? requestsQuery.isFetching || formSubmissionQuery.isFetching
      : isActions
        ? userActionsQuery.isFetching
        : processListQuery.isFetching;

  const isLoading = isTodo
    ? processListQuery.isLoading
    : isSent
      ? requestsQuery.isLoading || formSubmissionQuery.isLoading
      : isActions
        ? userActionsQuery.isLoading
        : processListQuery.isLoading;

  const hasError = isTodo
    ? processListQuery.isError
    : isSent
      ? requestsQuery.isError || formSubmissionQuery.isError
      : isActions
        ? userActionsQuery.isError
        : processListQuery.isError;

  const activeError = isTodo
    ? processListQuery.error
    : isSent
      ? (requestsQuery.error ?? formSubmissionQuery.error)
      : isActions
        ? userActionsQuery.error
        : processListQuery.error;
  const isForbidden = Number(activeError?.response?.status) === 403;
  const errorMessage = isForbidden
    ? isSent || isActions
      ? "شما دسترسی مشاهده ارسال‌ها و درخواست‌های فرایند را ندارید."
      : "شما دسترسی مشاهده فرایندها را ندارید."
    : getApiErrorMessage(
        activeError,
        isSent
          ? "دریافت ارسال‌ها انجام نشد."
          : isActions
            ? "دریافت درخواست‌های نیازمند اقدام انجام نشد."
            : "دریافت لیست فرایندها انجام نشد.",
      );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-slate-600 hover:!text-blue-600 dark:text-slate-300"
        >
          بازگشت به صفحه قبل
        </Button>

        {/* ---------- هدر ---------- */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-blue-500 to-sky-600 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                کارتابل فرآیندساز
              </h1>
              <p className="mt-1 mb-0 text-xs leading-7 text-blue-50 sm:text-sm">
                {currentUser.name} عزیز، فرم مورد نظر را باز کنید، تکمیل کنید و
                به گردش کار بفرستید.
              </p>
            </div>
            <Segmented
              size="large"
              value={tab}
              onChange={setTab}
              options={[
                {
                  label: "ثبت درخواست",
                  value: TABS.TODO,
                  icon: <InboxOutlined />,
                },
                {
                  label: "درخواست‌های جاری",
                  value: TABS.PROCESSES,
                  icon: <PartitionOutlined />,
                },
                {
                  label: "نیازمند اقدام من",
                  value: TABS.ACTIONS,
                  icon: <ThunderboltOutlined />,
                },
              ]}
            />
          </div>
        </div>

        {/* ---------- جدول ---------- */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="m-0 text-base font-bold text-slate-800 dark:text-slate-100">
                {isTodo
                  ? "فهرست فرایندهای قابل ثبت درخواست"
                  : isSent
                    ? "رسید ارسال‌های من"
                    : isActions
                      ? "درخواست‌های نیازمند اقدام شما"
                      : "درخواست‌های جاری به تفکیک فرایند"}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dataSource.length} مورد
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input.Search
                allowClear
                placeholder={
                  isTodo
                    ? "جستجوی نام فرایند یا فرم"
                    : isSent
                      ? "جستجوی ارسال‌کننده یا مقدار فیلدها"
                      : isActions
                        ? "جستجوی فرایند، مرحله یا عنوان درخواست"
                        : "جستجوی فرایند، درخواست یا ثبت‌کننده"
                }
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 280 }}
              />

              <Tooltip title="بارگذاری مجدد">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isRefreshing}
                  onClick={handleRefresh}
                />
              </Tooltip>
            </div>
          </div>

          {isActions ? (
            <div className="mb-4 grid gap-3 rounded-2xl border border-amber-100 bg-gradient-to-l from-amber-50 to-slate-50 p-4 sm:grid-cols-[1fr_240px_240px_auto] sm:items-end dark:border-amber-900/60 dark:from-amber-950/30 dark:to-slate-900">
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <ThunderboltOutlined className="text-amber-500" />
                  کارهای منتظر اقدام شما
                </div>
                <p className="mt-1 mb-0 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  این درخواست‌ها از همه فرایندها جمع‌آوری شده‌اند. فرم مرحله
                  فعلی را تکمیل و سپس عملیات ارجاع را انتخاب کنید.
                </p>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-slate-500">فرایند</div>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  placeholder="همه فرایندها"
                  value={actionProcessId}
                  options={processes.map((process) => ({
                    value: process.id,
                    label: process.name || `فرایند ${process.id}`,
                  }))}
                  onChange={(value) => setActionProcessId(value ?? null)}
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] text-slate-500">مرحله</div>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  placeholder="همه مراحل"
                  value={actionStateId}
                  loading={actionProcessInfoQuery.isLoading}
                  options={actionStateOptions}
                  onChange={(value) => setActionStateId(value ?? null)}
                />
              </div>
              <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-800">
                <div className="text-lg font-extrabold text-amber-600">
                  {filteredActionRows.length.toLocaleString("fa-IR")}
                </div>
                <div className="text-[10px] text-slate-400">نیازمند اقدام</div>
              </div>
            </div>
          ) : null}

          {isProcesses ? (
            <div className="mb-4 grid gap-3 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 to-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center dark:border-blue-900/60 dark:from-blue-950/30 dark:to-slate-900">
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <PartitionOutlined className="text-blue-500" />
                  مدیریت درخواست‌های در جریان
                </div>
                <p className="mt-1 mb-0 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  یک فرایند را انتخاب کنید تا مرحله فعلی درخواست‌ها را ببینید،
                  فرم همان مرحله را تکمیل کنید و با Action مناسب ارجاع دهید.
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-800">
                <div className="text-lg font-extrabold text-blue-600">
                  {filteredProcesses.length.toLocaleString("fa-IR")}
                </div>
                <div className="text-[10px] text-slate-400">
                  فرایند قابل پیگیری
                </div>
              </div>
            </div>
          ) : null}

          {hasError ? (
            <Alert
              type="error"
              showIcon
              className="mb-4"
              message={errorMessage}
              action={
                <Button size="small" onClick={handleRefresh}>
                  تلاش مجدد
                </Button>
              }
            />
          ) : null}

          <TableAntd
            rowKey={(record) =>
              record.rowKey || (isTodo ? `process-${record.id}` : record.id)
            }
            columns={
              isTodo
                ? todoCols
                : isSent
                  ? sentCols
                  : isActions
                    ? actionCols
                    : processCols
            }
            dataSource={dataSource}
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              onChange: setPage,
            }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  className="py-10"
                  description={
                    isTodo
                      ? "فرایندی برای شروع موجود نیست."
                      : isSent
                        ? "هنوز فرمی ارسال نکرده‌��ید."
                        : isActions
                          ? "درخواستی منتظر اقدام شما نیست."
                          : "فرایندی برای نمایش موجود نیست."
                  }
                />
              ),
            }}
          />
        </div>
      </div>

      {/* ---------- مودال‌ها ---------- */}
      {modalType === MODAL_TYPES.CARTABLE_TASK && (
        <CartableTaskModal
          open={isOpen}
          process={modalData}
          submitterId={currentUser.id}
          onClose={closeModal}
          onSubmitted={handleSubmitted}
        />
      )}

      {modalType === MODAL_TYPES.CARTABLE_SUBMISSION && (
        <CartableSubmissionModal
          open={isOpen}
          record={modalData}
          onClose={closeModal}
        />
      )}

      {modalType === MODAL_TYPES.PROCESS_REQUESTS && (
        <ProcessRequestsModal
          open={isOpen}
          process={modalData}
          onClose={closeProcessRequestsModal}
        />
      )}

      {modalType === MODAL_TYPES.PROCESS_PATH && (
        <ProcessPathModal
          open={isOpen}
          process={modalData}
          onClose={closeModal}
        />
      )}

      {modalType === MODAL_TYPES.USER_ACTION && (
        <UserActionRequestModal
          open={isOpen}
          record={modalData}
          onClose={closeModal}
          onCompleted={() => userActionsQuery.refetch()}
        />
      )}
    </div>
  );
};

const ProcessMaker = () => <ProcessMakerCartable />;

export default ProcessMaker;
