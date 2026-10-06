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
  Tooltip,
} from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  PartitionOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Header from "@/components/Layouts/Header.jsx";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { getUserFromToken } from "@/utils/ExportFromToken";
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

const ProcessMakerCartable = () => {
  const navigate = useNavigate();
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
  const dataSource =
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
  const isForbidden = Number(activeError?.response?.status) === 403;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="mx-auto max-w-[1500px] p-3 sm:p-5">
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(-1)}
          className="mb-3 text-slate-500"
        >
          بازگشت
        </Button>

        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit overflow-hidden rounded-3xl bg-slate-950 p-4 text-white shadow-xl lg:sticky lg:top-4">
            <div className="rounded-2xl bg-gradient-to-bl from-blue-600 to-indigo-600 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl">
                <ThunderboltOutlined />
              </div>
              <h1 className="mb-1 mt-4 text-lg font-black"> کارتابل فرآیند ها</h1>
              <p className="m-0 text-[11px] leading-6 text-blue-100">
                {currentUser.name}، کارهای مهم امروز شما اینجاست.
              </p>
            </div>

            <nav className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  value: TABS.TODO,
                  label: "ثبت درخواست جدید",
                  detail: "شروع یک گردش کار",
                  icon: <PlusOutlined />,
                  count: cartableSummary.processes,
                },
                {
                  value: TABS.PROCESSES,
                  label: "درخواست‌های جاری",
                  detail: "رصد و پیگیری فرایندها",
                  icon: <PartitionOutlined />,
                  count: cartableSummary.current,
                },
                {
                  value: TABS.ACTIONS,
                  label: "نیازمند اقدام من",
                  detail: "کارهای منتظر تصمیم",
                  icon: <ThunderboltOutlined />,
                  count: cartableSummary.actions,
                },
              ].map((item) => {
                const active = tab === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTab(item.value)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition ${
                      active
                        ? "border-white/20 bg-white text-slate-950 shadow-lg"
                        : "border-transparent bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">
                        {item.label}
                      </strong>
                      <small
                        className={`block truncate text-[9px] ${
                          active ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.detail}
                      </small>
                    </span>
                    <b className="text-sm tabular-nums">
                      {item.count.toLocaleString("fa-IR")}
                    </b>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-slate-900 via-slate-900 to-indigo-950 p-5 text-white shadow-xl sm:p-7">
              <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 text-[11px] font-semibold text-blue-300">
                     
                  </div>
                  <h2 className="m-0 text-xl font-black sm:text-3xl">
                    {isActions
                      ? "صف کارهای امروز شما"
                      : isProcesses
                        ? " فرایندهای جاری"
                        : "یک درخواست تازه شروع کنید"}
                  </h2>
                  <p className="mb-0 mt-2 max-w-2xl text-xs leading-6 text-slate-400">
                    {isActions
                      ? "درخواست‌های منتظر تصمیم، تکمیل فرم و ارجاع بعدی بدون پراکندگی در چند صفحه."
                      : isProcesses
                        ? "وضعیت هر فرایند، درخواست‌های باز و مسیر گردش را از یک نقطه کنترل کنید."
                        : "فرایند مناسب را انتخاب کنید، مسیر آن را ببینید و درخواست را ثبت کنید."}
                  </p>
                </div>
                <Button
                  ghost
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
                ["فرایند فعال", cartableSummary.processes, <PartitionOutlined />, "text-blue-500"],
                ["در حال گردش", cartableSummary.current, <BarChartOutlined />, "text-indigo-500"],
                ["تکمیل‌شده", cartableSummary.completed, <CheckCircleOutlined />, "text-emerald-500"],
                ["منتظر من", cartableSummary.actions, <ThunderboltOutlined />, "text-amber-500"],
              ].map(([label, value, icon, tone]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="text-[10px] text-slate-400">{label}</div>
                    <strong className="mt-1 block text-xl tabular-nums text-slate-900 dark:text-white">
                      {value.toLocaleString("fa-IR")}
                    </strong>
                  </div>
                  <span className={`text-xl ${tone}`}>{icon}</span>
                </div>
              ))}
            </div>

            <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
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
                  type="error"
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
                              className="group rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
                              className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                            >
                              <div className="bg-gradient-to-bl from-slate-900 to-indigo-950 p-4 text-white">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                    <PartitionOutlined />
                                  </span>
                                  <Button
                                    size="small"
                                    type="text"
                                    className="!text-white/70"
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
                            className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
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

const ProcessMaker = () => <ProcessMakerCartable />;

export default ProcessMaker;
