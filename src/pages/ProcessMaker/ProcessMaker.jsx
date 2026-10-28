import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Empty,
  Input,
  Pagination,
  Select,
  Tag,
} from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  EditOutlined,
  EyeOutlined,
  PartitionOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Header from "@/components/Layouts/Header.jsx";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { getUserFromToken } from "@/utils/ExportFromToken";
import { useProductTheme } from "@/components/Theme/ProductThemeContext.jsx";
import CartableTaskModal from "./components/CartableTaskModal";
import ProcessRequestsModal from "./components/ProcessRequestsModal";
import { requestRowsFromResponse } from "./components/ProcessRequestsModal";
import ProcessPathModal from "./components/ProcessPathModal";
import UserActionRequestModal from "./components/UserActionRequestModal";
import {
  useProcessInfo,
  useProcessKpis,
  useProcessList,
  useRequestsNeedUserAction,
} from "../../QueryServises/workflowQuery";
import useModal from "../../hooks/useModal";
import "./components/command-center.css";

const PAGE_SIZE = 8;

const TABS = Object.freeze({
  TODO: "todo",
  PROCESSES: "processes",
  ACTIONS: "actions",
});

const MODAL_TYPES = Object.freeze({
  CARTABLE_TASK: "cartableTask",
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

const isAccessDenied = (query) =>
  query?.isError && [401, 403].includes(Number(query.error?.response?.status));

// eslint-disable-next-line react/prop-types
const ProcessMakerCartable = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { globalTheme } = useProductTheme();
  const { isOpen, modalType, modalData, setModal, closeModal } = useModal();

  const currentUser = useMemo(readCurrentUser, []);
  const searchRef = useRef(null);

  const [tab, setTab] = useState(TABS.TODO);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionProcessId, setActionProcessId] = useState(null);
  const [actionStateId, setActionStateId] = useState(null);

  const actionTabIsVisible = tab === TABS.ACTIONS;
  const processTabIsVisible =
    tab === TABS.TODO || tab === TABS.PROCESSES || actionTabIsVisible;
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
  const processKpisQuery = useProcessKpis({
    ...permissionSensitiveQueryOptions,
    enabled: processTabIsVisible,
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
    enabled: true,
  });
  const actionProcessInfoQuery = useProcessInfo(actionProcessId, {
    ...permissionSensitiveQueryOptions,
    enabled: Boolean(actionTabIsVisible && actionProcessId),
  });

  // Authorization errors belong in the active panel, not in tab visibility.
  const visibleProcessTabs = useMemo(
    () => [
      {
        value: TABS.TODO,
        label: "ثبت درخواست جدید",
        icon: <PlusOutlined />,
      },
      {
        value: TABS.PROCESSES,
        label: "درخواست‌های جاری",
        icon: <PartitionOutlined />,
      },
      {
        value: TABS.ACTIONS,
        label: "نیازمند اقدام من",
        icon: <ThunderboltOutlined />,
      },
    ],
    [],
  );

  useEffect(() => {
    setPage(1);
  }, [actionProcessId, actionStateId, search, tab]);

  useEffect(() => {
    if (tab !== TABS.ACTIONS) return;
    setActionStateId(null);
  }, [actionProcessId, tab]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus?.();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

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
  const kpis = useMemo(
    () => asArray(processKpisQuery.data),
    [processKpisQuery.data],
  );
  const kpiByProcessId = useMemo(
    () => new Map(kpis.map((item) => [String(item?.id), item])),
    [kpis],
  );
  const cartableSummary = useMemo(
    () => ({
      processes: processes.length,
      current: kpis.reduce(
        (sum, item) => sum + (Number(item?.count_of_normal_request) || 0),
        0,
      ),
      completed: kpis.reduce(
        (sum, item) => sum + (Number(item?.count_of_completed_request) || 0),
        0,
      ),
      actions: actionRows.length,
    }),
    [actionRows.length, kpis, processes.length],
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
  const processForRecord = (record) =>
    processes.find(
      (process) => String(process?.id) === String(record?.processId),
    );

  const closeProcessRequestsModal = () => {
    closeModal();
  };

  const handleSubmitted = () => {
    processKpisQuery.refetch();
    setTab(TABS.PROCESSES);
  };

  // ---------- نمای فعال ----------
  const isTodo = tab === TABS.TODO;
  const isProcesses = tab === TABS.PROCESSES;
  const isActions = tab === TABS.ACTIONS;
  const activeQuery = isActions ? userActionsQuery : processListQuery;
  const dataSource = isAccessDenied(activeQuery) ? [] :
    (isTodo
      ? filteredTodo
      : isActions
          ? filteredActionRows
          : filteredProcesses) || [];

  // ---------- رفرش دستی ----------
  const handleRefresh = () => {
    if (isTodo) {
      processListQuery.refetch();
    } else if (isActions) {
      userActionsQuery.refetch();
    } else {
      processListQuery.refetch();
    }
  };

  const isRefreshing = isTodo
    ? processListQuery.isFetching
    : isActions
        ? userActionsQuery.isFetching
        : processListQuery.isFetching;

  const isLoading = isTodo
    ? processListQuery.isLoading
    : isActions
        ? userActionsQuery.isLoading
        : processListQuery.isLoading;

  const hasError = isTodo
    ? processListQuery.isError
    : isActions
        ? userActionsQuery.isError
        : processListQuery.isError;

  const activeError = isTodo
    ? processListQuery.error
    : isActions
        ? userActionsQuery.error
        : processListQuery.error;
  const isForbidden = [401, 403].includes(
    Number(activeError?.response?.status),
  );
  const errorMessage = isForbidden
    ? isActions
      ? "شما دسترسی مشاهده ارسال‌ها و درخواست‌های فرایند را ندارید."
      : "شما دسترسی مشاهده فرایندها را ندارید."
    : getApiErrorMessage(
        activeError,
        isActions
            ? "دریافت درخواست‌های نیازمند اقدام انجام نشد."
            : "دریافت لیست فرایندها انجام نشد.",
      );

  return (
    <div
      className={`work-cartable-process ${embedded ? "is-embedded" : ""}`}
      data-theme={globalTheme}
      dir="rtl"
    >
      {!embedded ? <Header /> : null}

      <div className="work-cartable-process__container">
        {!embedded ? (
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(-1)}
            className="work-cartable-process__back"
          >
            بازگشت
          </Button>
        ) : null}

        <div className="work-cartable-process__layout">
          <aside className="work-cartable-process__nav">
            <div className="work-cartable-process__nav-header">
              <div className="work-cartable-process__nav-mark">
                <ThunderboltOutlined />
              </div>
              <h1>کارتابل فرآیندها</h1>
              <p>
                {currentUser.name}، کارهای مهم امروز شما اینجاست.
              </p>
            </div>

            <nav className="work-cartable-process__nav-items">
              {visibleProcessTabs.map((item) => {
                const active = tab === item.value;
                const count =
                  item.value === TABS.TODO
                    ? cartableSummary.processes
                    : item.value === TABS.PROCESSES
                      ? cartableSummary.current
                      : cartableSummary.actions;
                const detail =
                  item.value === TABS.TODO
                    ? "شروع یک گردش کار"
                    : item.value === TABS.PROCESSES
                      ? "رصد و پیگیری فرایندها"
                      : "کارهای منتظر تصمیم";
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTab(item.value)}
                    className={`work-cartable-process__nav-item ${
                      active ? "is-active" : ""
                    }`}
                  >
                    <span className="work-cartable-process__nav-icon">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong>{item.label}</strong>
                      <small>{detail}</small>
                    </span>
                    <b>{count.toLocaleString("fa-IR")}</b>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0">
            <section className="work-cartable-process__hero">
              <div>
                <div>
                  <h2>
                    {isActions
                      ? "صف کارهای امروز شما"
                      : isProcesses
                        ? " فرایندهای جاری"
                        : "یک درخواست تازه شروع کنید"}
                  </h2>
                  <p>
                    {isActions
                      ? "درخواست‌های منتظر تصمیم، تکمیل فرم و ارجاع بعدی بدون پراکندگی در چند صفحه."
                      : isProcesses
                        ? "وضعیت هر فرایند، درخواست‌های باز و مسیر گردش را از یک نقطه کنترل کنید."
                        : "فرایند مناسب را انتخاب کنید، مسیر آن را ببینید و درخواست را ثبت کنید."}
                  </p>
                </div>
                <Button
                  icon={<ReloadOutlined />}
                  loading={isRefreshing}
                  onClick={handleRefresh}
                >
                  همگام‌سازی
                </Button>
              </div>
            </section>

            <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                ["فرایند فعال", cartableSummary.processes, <PartitionOutlined key="process" />],
                ["در حال گردش", cartableSummary.current, <BarChartOutlined key="current" />],
                ["تکمیل‌شده", cartableSummary.completed, <CheckCircleOutlined key="completed" />],
                ["منتظر من", cartableSummary.actions, <ThunderboltOutlined key="actions" />],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  className="work-cartable-process__metric"
                >
                  <div>
                    <div className="work-cartable-process__metric-label">{label}</div>
                    <strong>
                      {value.toLocaleString("fa-IR")}
                    </strong>
                  </div>
                  <span className="work-cartable-process__metric-icon">{icon}</span>
                </div>
              ))}
            </div>

            <section className="work-cartable-process__panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="m-0 text-base font-black text-slate-900 dark:text-white">
                    {isActions
                      ? "نیازمند اقدام شما"
                      : isProcesses
                        ? "فرایندهای در حال کار"
                        : "فرایندهای قابل شروع"}
                  </h3>
                  <p className="mb-0 mt-1 text-[11px] text-slate-400">
                    {dataSource.length.toLocaleString("fa-IR")} مورد پیدا شد
                  </p>
                </div>
                <Input.Search
                  ref={searchRef}
                  allowClear
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی سریع..."
                  className="w-full sm:!w-[320px]"
                  prefix={<SearchOutlined className="text-slate-300" />}
                  suffix={
                    <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400 dark:bg-slate-800">
                      Ctrl K
                    </kbd>
                  }
                />
              </div>

              {isActions ? (
                <div className="mt-4 grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-3 sm:grid-cols-2 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="فیلتر بر اساس فرایند"
                    value={actionProcessId}
                    options={processes.map((process) => ({
                      value: process.id,
                      label: process.name || `فرایند ${process.id}`,
                    }))}
                    onChange={(value) => setActionProcessId(value ?? null)}
                  />
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="فیلتر بر اساس مرحله"
                    value={actionStateId}
                    loading={actionProcessInfoQuery.isLoading}
                    options={actionStateOptions}
                    onChange={(value) => setActionStateId(value ?? null)}
                  />
                </div>
              ) : null}

              {hasError ? (
                <Alert
                  type={isForbidden ? "warning" : "error"}
                  showIcon
                  className="mt-4"
                  message={errorMessage}
                  action={<Button onClick={handleRefresh}>تلاش مجدد</Button>}
                />
              ) : null}

              {isLoading ? (
                <div className="grid gap-3 py-5 md:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="h-52 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : dataSource.length ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {dataSource
                      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                      .map((record) => {
                        if (isActions)
                          return (
                            <article
                              key={record.rowKey || record.id || record.requestId}
                              className="work-cartable-process__card group rounded-3xl p-4 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-lg text-amber-500 dark:bg-amber-950/40">
                                  <ThunderboltOutlined />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <strong className="block truncate text-sm text-slate-900 dark:text-white">
                                    {record.processName || "فرایند بدون نام"}
                                  </strong>
                                  <small className="text-slate-400">
                                    {record.title || `درخواست ${record.requestId}`}
                                  </small>
                                </div>
                                <Tag color="processing" className="m-0 shrink-0">
                                  {record.stateName || "بدون مرحله"}
                                </Tag>
                              </div>
                              <div className="my-4 rounded-2xl bg-slate-50 p-3 text-[11px] leading-6 text-slate-500 dark:bg-slate-800/70">
                                فرم مرحله فعلی را کامل کنید؛ مقصد هر Action پیش از ارجاع داخل Workbench نمایش داده می‌شود.
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="primary"
                                  block
                                  icon={<EditOutlined />}
                                  onClick={() => openUserActionModal(record)}
                                >
                                  باز کردن Workbench
                                </Button>
                                <Button
                                  icon={<PartitionOutlined />}
                                  disabled={!processForRecord(record)}
                                  onClick={() =>
                                    openProcessPathModal(processForRecord(record))
                                  }
                                />
                              </div>
                            </article>
                          );

                        const kpi = kpiByProcessId.get(String(record.id));
                        if (isProcesses)
                          return (
                            <article
                              key={record.id}
                              className="work-cartable-process__card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                            >
                              <div className="work-cartable-process__process-card-header p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                    <PartitionOutlined />
                                  </span>
                                  <Button
                                    size="small"
                                    type="text"
                                    className="work-cartable-process__dashboard-action"
                                    icon={<DashboardOutlined />}
                                    onClick={() =>
                                      navigate(`/processes/${record.id}/dashboard`)
                                    }
                                  >
                                    داشبورد
                                  </Button>
                                </div>
                                <h4 className="mb-1 mt-4 truncate text-base font-black">
                                  {record.name || "فرایند بدون نام"}
                                </h4>
                                <p className="m-0 truncate text-[10px] text-slate-400">
                                  {record.description || "گردش کار سازمانی"}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800">
                                {[
                                  ["باز", kpi?.count_of_normal_request],
                                  ["تکمیل", kpi?.count_of_completed_request],
                                  ["رد", kpi?.count_of_denied_request],
                                ].map(([label, value]) => (
                                  <div key={label} className="bg-white p-3 text-center dark:bg-slate-900">
                                    <b className="block text-sm">{Number(value || 0).toLocaleString("fa-IR")}</b>
                                    <small className="text-[9px] text-slate-400">{label}</small>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2 p-4">
                                <Button
                                  type="primary"
                                  block
                                  icon={<EyeOutlined />}
                                  onClick={() => openProcessRequestsModal(record)}
                                >
                                  مرکز درخواست‌ها
                                </Button>
                                <Button
                                  icon={<PartitionOutlined />}
                                  onClick={() => openProcessPathModal(record)}
                                />
                              </div>
                            </article>
                          );

                        return (
                          <article
                            key={record.id}
                              className="work-cartable-process__card group rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-xl"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-950/40">
                                <PlusOutlined />
                              </span>
                              <Tag color={record.is_active === false ? "default" : "success"}>
                                {record.is_active === false ? "غیرفعال" : "آماده ثبت"}
                              </Tag>
                            </div>
                            <h4 className="mb-1 mt-4 truncate text-base font-black text-slate-900 dark:text-white">
                              {record.name || "فرایند بدون نام"}
                            </h4>
                            <p className="h-12 overflow-hidden text-xs leading-6 text-slate-400">
                              {record.description || "برای شروع درخواست، فرم این فرایند را باز و تکمیل کنید."}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <Button
                                type="primary"
                                block
                                icon={<PlusOutlined />}
                                disabled={record.is_active === false}
                                onClick={() => openTaskModal(record)}
                              >
                                شروع درخواست
                              </Button>
                              <Button
                                icon={<PartitionOutlined />}
                                onClick={() => openProcessPathModal(record)}
                              />
                            </div>
                          </article>
                        );
                      })}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      current={page}
                      pageSize={PAGE_SIZE}
                      total={dataSource.length}
                      hideOnSinglePage
                      onChange={setPage}
                    />
                  </div>
                </>
              ) : (
                <Empty
                  className="py-16"
                  description={
                    isActions
                      ? "عالیه! درخواستی منتظر اقدام شما نیست."
                      : isProcesses
                        ? "فرایندی برای پیگیری پیدا نشد."
                        : "فرایندی برای شروع درخواست وجود ندارد."
                  }
                />
              )}
            </section>
          </main>
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

// eslint-disable-next-line react/prop-types
const ProcessMaker = ({ embedded = false }) => (
  <ProcessMakerCartable embedded={embedded} />
);

export default ProcessMaker;
