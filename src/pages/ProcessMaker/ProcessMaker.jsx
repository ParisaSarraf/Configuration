import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, App, Button, Empty, Input, Segmented, Tooltip } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Layouts/Header.jsx";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import CartableTaskModal from "./components/CartableTaskModal";
import { appendSentItem, clearSentItems, loadSentItems } from "./cartableStore";
import { TableAntd } from "../../components/TableAntd/TableAntd";
import todoColumns from "./components/todoColumns";
import sentColumns from "./components/sentColumns";
import { useFormDefinitions } from "../../QueryServises/formsQuery";
import useModal from "../../hooks/useModal";

const PAGE_SIZE = 8;

const TABS = Object.freeze({
  TODO: "todo",
  SENT: "sent",
});

const MODAL_TYPES = Object.freeze({
  CARTABLE_TASK: "cartableTask",
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

const ProcessMakerCartable = () => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { isOpen, modalType, modalData, setModal, closeModal } = useModal();

  const currentUser = useMemo(readCurrentUser, []);
  const formDefinitionsQuery = useFormDefinitions();

  const [tab, setTab] = useState(TABS.TODO);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sentItems, setSentItems] = useState([]);

  useEffect(() => {
    setSentItems(loadSentItems(currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const forms = useMemo(
    () => asArray(formDefinitionsQuery.data),
    [formDefinitionsQuery.data],
  );

  const todoItems = forms;

  const activeFormsCount = useMemo(
    () => forms.filter((f) => f?.is_active).length,
    [forms],
  );
  const inactiveFormsCount = Math.max(forms.length - activeFormsCount, 0);

  const filteredTodo = useMemo(() => {
    const term = normalize(search);
    if (!term) return todoItems;
    return todoItems.filter(
      (item) =>
        normalize(item?.name).includes(term) ||
        normalize(item?.description).includes(term) ||
        normalize(item?.category?.name).includes(term),
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

  const openTaskModal = (record) => {
    setModal({
      type: MODAL_TYPES.CARTABLE_TASK,
      mode: "add",
      data: record,
    });
  };

  const isTodo = tab === TABS.TODO;
  const dataSource = isTodo ? filteredTodo : filteredSent;

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
    () => sentColumns({ page, pageSize: PAGE_SIZE }),
    [page],
  );

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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="m-0 text-base font-bold text-slate-800 dark:text-slate-100">
                {isTodo ? "فهرست فرم‌های قابل تکمیل" : "رسید ارسال‌های من"}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dataSource.length} مورد
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input.Search
                allowClear
                placeholder="جستجوی نام فرم، توضیحات یا دسته‌بندی"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 280 }}
              />
              {isTodo ? (
                <Tooltip title="بارگذاری مجدد">
                  <Button
                    icon={<ReloadOutlined />}
                    loading={formDefinitionsQuery.isFetching}
                    onClick={() => formDefinitionsQuery.refetch()}
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

          {isTodo && formDefinitionsQuery.isError ? (
            <Alert
              type="error"
              showIcon
              className="mb-4"
              message={getApiErrorMessage(
                formDefinitionsQuery.error,
                "دریافت لیست فرم‌ها انجام نشد.",
              )}
              action={
                <Button
                  size="small"
                  onClick={() => formDefinitionsQuery.refetch()}
                >
                  تلاش مجدد
                </Button>
              }
            />
          ) : null}

          <TableAntd
            rowKey={(record) =>
              isTodo
                ? record.id
                : `${record.processId}-${record.submissionId ?? record.sentAt}`
            }
            columns={isTodo ? todoCols : sentCols}
            dataSource={dataSource}
            loading={isTodo && formDefinitionsQuery.isLoading}
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
                      ? "فرمی برای تکمیل موجود نیست."
                      : "هنوز فرمی ارسال نکرده‌اید."
                  }
                />
              ),
            }}
          />
        </div>
      </div>

      {modalType === MODAL_TYPES.CARTABLE_TASK && (
        <CartableTaskModal
          open={isOpen}
          process={modalData}
          submitterId={currentUser.id}
          onClose={closeModal}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
};

const ProcessMaker = () => <ProcessMakerCartable />;

export default ProcessMaker;
