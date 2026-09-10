import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  Empty,
  Input,
  Segmented,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Layouts/Header.jsx";
import { useProcessList } from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import CartableTaskDrawer from "./components/CartableTaskDrawer";
import { appendSentItem, clearSentItems, loadSentItems } from "./cartableStore";

const PAGE_SIZE = 8;

const TABS = Object.freeze({
  TODO: "todo",
  SENT: "sent",
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
  try {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return { id: null, name: "کاربر" };
    const decoded = jwtDecode(token) || {};
    return {
      id: decoded.user_id ?? decoded.id ?? decoded.pk ?? null,
      name:
        decoded.name && decoded.last_name
          ? `${decoded.name} ${decoded.last_name}`
          : decoded.name || decoded.username || "کاربر",
    };
  } catch {
    return { id: null, name: "کاربر" };
  }
};

const StatCard = ({ icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tone}`}
    >
      {icon}
    </span>
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  </div>
);

const ProcessMakerCartable = () => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const currentUser = useMemo(readCurrentUser, []);
  const listQuery = useProcessList();

  const [tab, setTab] = useState(TABS.TODO);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeProcess, setActiveProcess] = useState(null);
  const [sentItems, setSentItems] = useState([]);

  useEffect(() => {
    setSentItems(loadSentItems(currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const processes = useMemo(() => asArray(listQuery.data), [listQuery.data]);

  const todoItems = useMemo(
    () => processes.filter((item) => Boolean(item?.form_definition?.id)),
    [processes],
  );
  const withoutFormCount = Math.max(processes.length - todoItems.length, 0);

  const filteredTodo = useMemo(() => {
    const term = normalize(search);
    if (!term) return todoItems;
    return todoItems.filter(
      (item) =>
        normalize(item?.name).includes(term) ||
        normalize(item?.form_definition?.name).includes(term),
    );
  }, [todoItems, search]);

  const filteredSent = useMemo(() => {
    const term = normalize(search);
    if (!term) return sentItems;
    return sentItems.filter(
      (item) =>
        normalize(item?.processName).includes(term) ||
        normalize(item?.formName).includes(term),
    );
  }, [sentItems, search]);

  const handleSubmitted = (receipt) => {
    setSentItems(appendSentItem(currentUser.id, receipt));
  };

  const handleClearSent = () => {
    modal.confirm({
      title: "پاک‌کردن تاریخچه",
      content:
        "این فهرست فقط رسید ارسال‌های شما در این مرورگر است و فرم‌های ثبت‌شده در سرور حذف نمی‌شوند.",
      okText: "پاک کن",
      cancelText: "انصراف",
      onOk: () => {
        setSentItems(clearSentItems(currentUser.id));
        message.success("تاریخچه پاک شد.");
      },
    });
  };

  const todoColumns = useMemo(
    () => [
      {
        title: "ردیف",
        key: "index",
        width: 72,
        render: (_value, _record, index) => (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {(page - 1) * PAGE_SIZE + index + 1}
          </span>
        ),
      },
      {
        title: "نام فرایند",
        dataIndex: "name",
        key: "name",
        render: (value) => (
          <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            {value || "بدون نام"}
          </span>
        ),
      },
      {
        title: "فرم مرتبط",
        key: "form",
        render: (_value, record) => (
          <Tooltip title={record?.form_definition?.description || ""}>
            <Tag icon={<FileTextOutlined />} color="blue">
              {record?.form_definition?.name || "—"}
            </Tag>
          </Tooltip>
        ),
      },
      {
        title: "وضعیت فرم",
        key: "status",
        width: 120,
        render: (_value, record) =>
          record?.form_definition?.is_active === false ? (
            <Tag color="default">غیرفعال</Tag>
          ) : (
            <Tag color="green">فعال</Tag>
          ),
      },
      {
        title: "عملیات",
        key: "operations",
        width: 220,
        align: "left",
        render: (_value, record) => (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setActiveProcess(record)}
          >
            مشاهده و تکمیل فرم
          </Button>
        ),
      },
    ],
    [page],
  );

  const sentColumns = useMemo(
    () => [
      {
        title: "ردیف",
        key: "index",
        width: 72,
        render: (_value, _record, index) => (page - 1) * PAGE_SIZE + index + 1,
      },
      {
        title: "فرایند",
        dataIndex: "processName",
        key: "processName",
        render: (value) => value || "—",
      },
      {
        title: "فرم",
        dataIndex: "formName",
        key: "formName",
        render: (value) => <Tag color="blue">{value || "—"}</Tag>,
      },
      {
        title: "ایستگاه شروع",
        dataIndex: "stateName",
        key: "stateName",
        render: (value) => (value ? <Tag color="green">{value}</Tag> : "—"),
      },
      {
        title: "تعداد فیلد تکمیل‌شده",
        dataIndex: "fieldCount",
        key: "fieldCount",
        width: 160,
      },
      {
        title: "زمان ارسال",
        dataIndex: "sentAt",
        key: "sentAt",
        render: (value) => (
          <Tag color="purple">
            {value ? georgianDateTimeToJalaliDateTime(value) : "—"}
          </Tag>
        ),
      },
    ],
    [page],
  );

  const isTodo = tab === TABS.TODO;
  const dataSource = isTodo ? filteredTodo : filteredSent;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
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

        <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-orange-500 to-amber-600 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                کارتابل فرآیندساز
              </h1>
              <p className="mt-1 mb-0 text-xs leading-7 text-orange-50 sm:text-sm">
                {currentUser.name} عزیز، فرم هر فرایند را باز کنید، تکمیل کنید و
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<InboxOutlined />}
            label="فرم‌های قابل تکمیل"
            value={todoItems.length}
            tone="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={<CheckCircleOutlined />}
            label="ارسال‌شده‌های من"
            value={sentItems.length}
            tone="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={<ClockCircleOutlined />}
            label="فرایندهای بدون فرم"
            value={withoutFormCount}
            tone="bg-slate-100 text-slate-600"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="m-0 text-base font-bold text-slate-800 dark:text-slate-100">
                {isTodo ? "فهرست کارهای کارتابل" : "رسید ارسال‌های من"}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dataSource.length} مورد
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input.Search
                allowClear
                placeholder="جستجوی نام فرایند یا فرم"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 260 }}
              />
              {isTodo ? (
                <Tooltip title="بارگذاری مجدد">
                  <Button
                    icon={<ReloadOutlined />}
                    loading={listQuery.isFetching}
                    onClick={() => listQuery.refetch()}
                  />
                </Tooltip>
              ) : (
                <Button
                  danger
                  onClick={handleClearSent}
                  disabled={!sentItems.length}
                >
                  پاک‌کردن تاریخچه
                </Button>
              )}
            </div>
          </div>

          {isTodo && listQuery.isError ? (
            <Alert
              type="error"
              showIcon
              className="mb-4"
              message={getApiErrorMessage(
                listQuery.error,
                "دریافت کارهای کارتابل انجام نشد.",
              )}
              action={
                <Button size="small" onClick={() => listQuery.refetch()}>
                  تلاش مجدد
                </Button>
              }
            />
          ) : null}

          <Table
            rowKey={(record) =>
              isTodo
                ? record.id
                : `${record.processId}-${record.submissionId ?? record.sentAt}`
            }
            columns={isTodo ? todoColumns : sentColumns}
            dataSource={dataSource}
            loading={isTodo && listQuery.isLoading}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              hideOnSinglePage: true,
              onChange: setPage,
            }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  className="py-10"
                  description={
                    isTodo
                      ? "کاری در کارتابل شما نیست؛ برای شروع، در فرایندساز به هر فرایند یک فرم وصل کنید."
                      : "هنوز فرمی ارسال نکرده‌اید."
                  }
                >
                  {isTodo ? (
                    <Button
                      type="primary"
                      onClick={() => navigate("/processes")}
                    >
                      رفتن به فرایندساز
                    </Button>
                  ) : null}
                </Empty>
              ),
            }}
          />
        </div>
      </div>

      <CartableTaskDrawer
        open={Boolean(activeProcess)}
        process={activeProcess}
        submitterId={currentUser.id}
        onClose={() => setActiveProcess(null)}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
};

const ProcessMaker = () => (
  <ConfigProvider direction="rtl">
    <App>
      <ProcessMakerCartable />
    </App>
  </ConfigProvider>
);

export default ProcessMaker;
