import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  Input,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Header from "@/components/Layouts/Header.jsx";
import {
  getApiErrorMessage,
} from "@/Services/forms/formUtils";
import {
  useDeleteProcess,
  useProcessList,
} from "@/QueryServises/workflowQuery";
import ProccessDetailModal from "./ProcessBuilder/components/ProccessDetailModal";
import useModal from "../../hooks/useModal";
import CreateProccessModal from "./ProcessBuilder/components/CreateProccessModal";

const PAGE_SIZE = 8;

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const normalize = (value) =>
  String(value ?? "")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const ProcessesList = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();

  const listQuery = useProcessList();
  const deleteMutation = useDeleteProcess();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [highlightId, setHighlightId] = useState(null);

  const processes = useMemo(() => asArray(listQuery.data), [listQuery.data]);

  const filtered = useMemo(() => {
    const term = normalize(search);
    if (!term) return processes;
    return processes.filter((process) =>
      normalize(process?.name).includes(term),
    );
  }, [processes, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = setTimeout(() => setHighlightId(null), 6000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const handleDelete = async (processId) => {
    try {
      await deleteMutation.mutateAsync(processId);
      message.success("فرایند حذف شد.");
    } catch (error) {
      message.error(getApiErrorMessage(error, "حذف فرایند انجام نشد."));
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "نام فرایند",
        dataIndex: "name",
        key: "name",
        render: (value, _record, index) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-Box text-sm font-bold text-Main dark:bg-slate-800 dark:text-slate-200">
              {(page - 1) * PAGE_SIZE + index + 1}
            </span>
            <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
              {value || "بدون نام"}
            </span>
          </div>
        ),
      },
      {
        title: "عملیات",
        key: "operations",
        width: 340,
        align: "left",
        render: (_value, record) => (
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate(`/processes/${record.id}/builder`)}
            >
              شروع فرایندساز
            </Button>

            <Tooltip title="ویرایش نام فرایند">
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  setModal({
                    mode: "edit",
                    data: record,
                    type: "CreateProccess",
                  })
                }
              >
                ویرایش نام
              </Button>
            </Tooltip>

            <Popconfirm
              title="حذف فرایند"
              description="با حذف فرایند، ایستگاه‌ها و ارتباطات آن نیز از دسترس خارج می‌شوند."
              okText="حذف"
              cancelText="انصراف"
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="حذف فرایند">
                <Button danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>

            <Tooltip title="جزئیات فرایند">
              <Button
                icon={<SettingOutlined />}
                className="text-sky-500 border-sky-500"
                onClick={() =>
                  setModal({
                    mode: "detail",
                    data: record,
                    type: "ProccessDetail",
                  })
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, setModal, page],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      <Header />

      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-slate-600 hover:!text-Main dark:text-slate-300"
        >
          بازگشت به صفحه قبل
        </Button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-l from-Main to-slate-700 p-5 shadow-sm sm:p-7 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                فرایندها
              </h1>
              <p className="mt-1 text-xs leading-7 text-slate-200 sm:text-sm">
                گردش کار درخواست‌ها را در سه مرحله‌ی ساده بسازید و مدیریت کنید.
              </p>
            </div>
            <Button
              size="large"
              icon={<PlusOutlined />}
              onClick={() =>
                setModal({ mode: "create", data: null, type: "CreateProccess" })
              }
              className="!h-11 !border-none !bg-white !font-semibold !text-Main hover:!bg-slate-100"
            >
              ثبت فرایند جدید
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                فهرست فرایندها
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {processes.length} فرایند
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input.Search
                allowClear
                placeholder="جستجوی نام فرایند"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 240 }}
              />
              <Tooltip title="بارگذاری مجدد">
                <Button
                  icon={<ReloadOutlined />}
                  loading={listQuery.isFetching}
                  onClick={() => listQuery.refetch()}
                />
              </Tooltip>
            </div>
          </div>

          {listQuery.isError ? (
            <Alert
              type="error"
              showIcon
              className="mb-4"
              message={getApiErrorMessage(
                listQuery.error,
                "دریافت لیست فرایندها انجام نشد.",
              )}
              action={
                <Button size="small" onClick={() => listQuery.refetch()}>
                  تلاش مجدد
                </Button>
              }
            />
          ) : null}

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={listQuery.isLoading}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              hideOnSinglePage: true,
              onChange: setPage,
            }}
            scroll={{ x: "max-content" }}
            rowClassName={(record) =>
              String(record?.id) === String(highlightId)
                ? "bg-Box dark:bg-slate-800"
                : ""
            }
            locale={{
              emptyText: (
                <div className="flex flex-col items-center gap-2 py-10">
                  <p className="m-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    هنوز فرایندی ثبت نشده است
                  </p>
                  <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
                    برای شروع، نام اولین فرایند خود را ثبت کنید.
                  </p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="mt-2"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    ثبت فرایند جدید
                  </Button>
                </div>
              ),
            }}
          />
        </div>
      </div>

      <CreateProccessModal
        modalData={modalData}
        modalMode={modalMode}
        isOpen={modalType === "CreateProccess" && isOpen}
        closeModal={closeModal}
        listQuery={listQuery}
      />
      <ProccessDetailModal
        modalData={modalData}
        modalMode={modalMode}
        isOpen={modalType === "ProccessDetail" && isOpen}
        closeModal={closeModal}
      />
    </div>
  );
};

const Processes = () => (
  <ConfigProvider direction="rtl">
    <App>
      <ProcessesList />
    </App>
  </ConfigProvider>
);

export default Processes;
