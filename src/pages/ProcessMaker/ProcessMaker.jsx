import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Empty, Input, Segmented, Tooltip } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  InboxOutlined,
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
import { useFormSubmisions } from "../../QueryServises/formsQuery";
import {
  useProcessList,
  useRequests,
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
});

const MODAL_TYPES = Object.freeze({
  CARTABLE_TASK: "cartableTask",
  CARTABLE_SUBMISSION: "cartableSubmission",
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

  const processListQuery = useProcessList();

  const formSubmissionQuery = useFormSubmisions();
  const requestsQuery = useRequests();

  const [tab, setTab] = useState(TABS.TODO);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  // ---------- مودال‌ها ----------
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

  const handleSubmitted = () => {
    requestsQuery.refetch();
    formSubmissionQuery.refetch();
    setTab(TABS.SENT);
  };

  // ---------- ستون‌ها ----------
  const isTodo = tab === TABS.TODO;
  const dataSource = (isTodo ? filteredTodo : filteredSent) || [];

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

  // ---------- رفرش دستی ----------
  const handleRefresh = () => {
    if (isTodo) {
      processListQuery.refetch();
    } else {
      requestsQuery.refetch();
      formSubmissionQuery.refetch();
    }
  };

  const isRefreshing = isTodo
    ? processListQuery.isFetching
    : requestsQuery.isFetching || formSubmissionQuery.isFetching;

  const isLoading = isTodo
    ? processListQuery.isLoading
    : requestsQuery.isLoading || formSubmissionQuery.isLoading;

  const hasError = isTodo
    ? processListQuery.isError
    : requestsQuery.isError || formSubmissionQuery.isError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-slate-600 hover:!text-orange-600 dark:text-slate-300"
        >
          بازگشت به صفحه قبل
        </Button>

        {/* ---------- هدر ---------- */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-orange-500 to-amber-600 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                کارتابل فرآیندساز
              </h1>
              <p className="mt-1 mb-0 text-xs leading-7 text-orange-50 sm:text-sm">
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
                  label: "ارسال‌شده‌ها",
                  value: TABS.SENT,
                  icon: <CheckCircleOutlined />,
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
                {isTodo ? "فهرست فرایندهای قابل شروع" : "رسید ارسال‌های من"}
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
                    : "جستجوی ارسال‌کننده یا مقدار فیلدها"
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
              message={getApiErrorMessage(
                isTodo
                  ? processListQuery.error
                  : (requestsQuery.error ?? formSubmissionQuery.error),
                isTodo
                  ? "دریافت لیست فرایندها انجام نشد."
                  : "دریافت ارسال‌ها انجام نشد.",
              )}
              action={
                <Button size="small" onClick={handleRefresh}>
                  تلاش مجدد
                </Button>
              }
            />
          ) : null}

          <TableAntd
            rowKey={(record) => (isTodo ? `process-${record.id}` : record.rowKey)}
            columns={isTodo ? todoCols : sentCols}
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
                      : "هنوز فرمی ارسال نکرده‌اید."
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
    </div>
  );
};

const ProcessMaker = () => <ProcessMakerCartable />;

export default ProcessMaker;
