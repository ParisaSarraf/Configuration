import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Empty, Input, Segmented, Tooltip } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  PartitionOutlined,
  ReloadOutlined,
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
import { useFormSubmisions } from "../../QueryServises/formsQuery";
import { useProcessList, useRequests } from "../../QueryServises/workflowQuery";
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
});

const MODAL_TYPES = Object.freeze({
  CARTABLE_TASK: "cartableTask",
  CARTABLE_SUBMISSION: "cartableSubmission",
  PROCESS_REQUESTS: "processRequests",
});

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
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
  const [submissionPreview, setSubmissionPreview] = useState(null);

  const processTabIsVisible = tab === TABS.TODO || tab === TABS.PROCESSES;
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

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  // ---------- فرایندهای قابل شروع (TODO) ----------
  // دیتای تب «کارهای من» از API فرایند خوانده می‌شود، نه لیست فرم‌ها.
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

  // ---------- مودا��‌ها ----------
  const openTaskModal = (record) => {
    setModal({
      type: MODAL_TYPES.CARTABLE_TASK,
      mode: "add",
      data: record,
    });
  };

  const openSubmissionModal = (record) => {
    if (modalType === MODAL_TYPES.PROCESS_REQUESTS) {
      setSubmissionPreview(record);
      return;
    }

    setModal({
      type: MODAL_TYPES.CARTABLE_SUBMISSION,
      mode: "view",
      data: record,
    });
  };

  const closeSubmissionPreview = () => {
    setSubmissionPreview(null);
  };

  const openProcessRequestsModal = (record) => {
    setSubmissionPreview(null);
    setModal({
      type: MODAL_TYPES.PROCESS_REQUESTS,
      mode: "view",
      data: record,
    });
  };

  const closeProcessRequestsModal = () => {
    setSubmissionPreview(null);
    closeModal();
  };

  const handleSubmitted = () => {
    requestsQuery.refetch();
    formSubmissionQuery.refetch();
    setTab(TABS.SENT);
  };

  // ---------- ستون‌ها ----------
  const isTodo = tab === TABS.TODO;
  const isSent = tab === TABS.SENT;
  const isProcesses = tab === TABS.PROCESSES;
  const dataSource =
    (isTodo ? filteredTodo : isSent ? filteredSent : filteredProcesses) || [];

  const todoCols = useMemo(
    () =>
      todoColumns({
        page,
        setActiveProcess: openTaskModal,
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
    } else {
      processListQuery.refetch();
    }
  };

  const isRefreshing = isTodo
    ? processListQuery.isFetching
    : isSent
      ? requestsQuery.isFetching || formSubmissionQuery.isFetching
      : processListQuery.isFetching;

  const isLoading = isTodo
    ? processListQuery.isLoading
    : isSent
      ? requestsQuery.isLoading || formSubmissionQuery.isLoading
      : processListQuery.isLoading;

  const hasError = isTodo
    ? processListQuery.isError
    : isSent
      ? requestsQuery.isError || formSubmissionQuery.isError
      : processListQuery.isError;

  const activeError = isTodo
    ? processListQuery.error
    : isSent
      ? (requestsQuery.error ?? formSubmissionQuery.error)
      : processListQuery.error;
  const isForbidden = Number(activeError?.response?.status) === 403;
  const errorMessage = isForbidden
    ? isSent
      ? "شما دسترسی مشاهده ارسال‌ها و درخواست‌های فرایند را ندارید."
      : "شما دسترسی مشاهده فرایندها را ندارید."
    : getApiErrorMessage(
        activeError,
        isSent
          ? "دریافت ارسال‌ها انجام نشد."
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
                  label: "کارهای من",
                  value: TABS.TODO,
                  icon: <InboxOutlined />,
                },
                {
                  label: "فرآیند ها",
                  value: TABS.PROCESSES,
                  icon: <PartitionOutlined />,
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
                  ? "فهرست فرایندهای قابل شروع"
                  : isSent
                    ? "رسید ارسال‌های من"
                    : "درخواست‌های هر فرآیند"}
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
            columns={isTodo ? todoCols : isSent ? sentCols : processCols}
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
          onViewSubmission={openSubmissionModal}
        />
      )}

      {modalType === MODAL_TYPES.PROCESS_REQUESTS && submissionPreview && (
        <CartableSubmissionModal
          open={Boolean(submissionPreview)}
          record={submissionPreview}
          onClose={closeSubmissionPreview}
          zIndex={1200}
        />
      )}
    </div>
  );
};

const ProcessMaker = () => <ProcessMakerCartable />;

export default ProcessMaker;
