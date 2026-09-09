import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  Input,
  Modal,
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
  ThunderboltOutlined,
} from "@ant-design/icons";

import Header from "@/components/Layouts/Header.jsx";
import {
  extractEntityId,
  getApiErrorMessage,
} from "@/Services/forms/formUtils";
import {
  useCreateProcess,
  useDeleteProcess,
  useProcessList,
  useUpdateProcess,
} from "@/QueryServises/workflowQuery";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const STEPS = [
  {
    title: "ثبت فرایند",
    description: "یک نام برای فرایند ثبت کنید تا در فهرست پایین ساخته شود.",
  },
  {
    title: "طراحی مراحل",
    description: "با دکمه‌ی «شروع فرایندساز» ایستگاه‌ها و عملیات را بچینید.",
  },
  {
    title: "بهره‌برداری",
    description: "درخواست‌ها روی فرایند طراحی‌شده جریان می‌گیرند.",
  },
];

const ProcessesList = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const listQuery = useProcessList();
  const createMutation = useCreateProcess();
  const updateMutation = useUpdateProcess();
  const deleteMutation = useDeleteProcess();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [highlightId, setHighlightId] = useState(null);

  const processes = useMemo(() => asArray(listQuery.data), [listQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim();
    if (!term) return processes;
    return processes.filter((process) =>
      String(process?.name ?? "").includes(term),
    );
  }, [processes, search]);

  const activeStep = processes.length ? 1 : 0;

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = setTimeout(() => setHighlightId(null), 6000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      message.warning("نام فرایند الزامی است.");
      return;
    }

    try {
      const response = await createMutation.mutateAsync({ name });
      const processId = extractEntityId(response);
      setIsCreateOpen(false);
      setNewName("");
      setSearch("");
      if (processId) setHighlightId(processId);
      message.success("فرایند ثبت شد. حالا با «شروع فرایندساز» مراحل را بچینید.");
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          "ثبت فرایند انجام نشد. از داشتن دسترسی «ایجاد فرایند» مطمئن شوید.",
        ),
      );
    }
  };

  const handleRename = async () => {
    const name = renameValue.trim();
    if (!name) {
      message.warning("نام فرایند الزامی است.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        processId: renameTarget.id,
        name,
      });
      setRenameTarget(null);
      setRenameValue("");
      message.success("نام فرایند ویرایش شد.");
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          "ویرایش نام فرایند انجام نشد. از داشتن دسترسی «ویرایش فرایند» مطمئن شوید.",
        ),
      );
    }
  };

  const handleDelete = async (processId) => {
    try {
      await deleteMutation.mutateAsync(processId);
      message.success("فرایند حذف شد.");
    } catch (error) {
      message.error(getApiErrorMessage(error, "حذف فرایند انجام نشد."));
    }
  };

  const columns = [
    {
      title: "نام فرایند",
      dataIndex: "name",
      key: "name",
      render: (value, _record, index) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-Box text-sm font-bold text-Main dark:bg-slate-800 dark:text-slate-200">
            {index + 1}
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
        <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => {
                setRenameTarget(record);
                setRenameValue(record?.name ?? "");
              }}
            >
              ویرایش نام
            </Button>
          </Tooltip>

          <Popconfirm
            title="حذف فرایند"
            description="با حذف فرایند، ایستگاه‌ها و ارتباطات آن نیز از دسترس خارج می‌شوند."
            okText="حذف"
            cancelText="انصراف"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="حذف فرایند">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
              onClick={() => setIsCreateOpen(true)}
              className="!h-11 !border-none !bg-white !font-semibold !text-Main hover:!bg-slate-100"
            >
              ثبت فرایند جدید
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            return (
              <div
                key={step.title}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? "border-Main/30 bg-Box shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-Main text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {step.title}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-7 text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            );
          })}
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
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
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

      <Modal
        open={isCreateOpen}
        title="مرحله ۱ — ثبت فرایند"
        okText="ثبت فرایند"
        cancelText="انصراف"
        confirmLoading={createMutation.isPending}
        onOk={handleCreate}
        onCancel={() => {
          setIsCreateOpen(false);
          setNewName("");
        }}
      >
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs leading-7 text-slate-500">
            فقط نام فرایند را وارد کنید. طراحی ایستگاه‌ها و عملیات در مرحله‌ی
            بعد و داخل فرایندساز انجام می‌شود.
          </p>
          <label className="text-xs font-semibold text-slate-600">
            نام فرایند
          </label>
          <Input
            value={newName}
            maxLength={255}
            autoFocus
            placeholder="مانند: درخواست خرید"
            onChange={(event) => setNewName(event.target.value)}
            onPressEnter={handleCreate}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(renameTarget)}
        title="ویرایش نام فرایند"
        okText="ذخیره نام"
        cancelText="انصراف"
        confirmLoading={updateMutation.isPending}
        onOk={handleRename}
        onCancel={() => {
          setRenameTarget(null);
          setRenameValue("");
        }}
      >
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs leading-7 text-slate-500">
            با این فرم فقط نام فرایند تغییر می‌کند و ایستگاه‌ها و عملیات دست‌نخورده
            می‌مانند.
          </p>
          <label className="text-xs font-semibold text-slate-600">
            نام فرایند
          </label>
          <Input
            value={renameValue}
            maxLength={255}
            autoFocus
            onChange={(event) => setRenameValue(event.target.value)}
            onPressEnter={handleRename}
          />
        </div>
      </Modal>
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
