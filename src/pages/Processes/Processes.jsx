import { useMemo, useState } from "react";
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
import { EditOutlined } from "@ant-design/icons";
import { Plus, Trash2 } from "lucide-react";

import {
  extractEntityId,
  getApiErrorMessage,
} from "@/Services/forms/formUtils";
import {
  useCreateProcess,
  useDeleteProcess,
  useProcessList,
} from "@/QueryServises/workflowQuery";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const ProcessesList = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const listQuery = useProcessList();
  const createMutation = useCreateProcess();
  const deleteMutation = useDeleteProcess();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const processes = useMemo(() => asArray(listQuery.data), [listQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim();
    if (!term) return processes;
    return processes.filter((process) =>
      String(process?.name ?? "").includes(term),
    );
  }, [processes, search]);

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
      message.success("فرایند ایجاد شد.");
      if (processId) navigate(`/processes/${processId}/builder`);
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          "ایجاد فرایند انجام نشد. از داشتن دسترسی «ایجاد فرایند» مطمئن شوید.",
        ),
      );
    }
  };

  const handleDelete = async (processId) => {
    try {
      await deleteMutation.mutateAsync(processId);
      message.success("فرایند حذف شد.");
    } catch (error) {
      message.error(
        getApiErrorMessage(error, "حذف فرایند انجام نشد."),
      );
    }
  };

  const columns = [
    {
      title: "نام فرایند",
      dataIndex: "name",
      key: "name",
      render: (value) => (
        <span className="font-medium">{value || "بدون نام"}</span>
      ),
    },
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "عملیات",
      key: "operations",
      width: 160,
      render: (_value, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="ویرایش در فرایندساز">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/processes/${record.id}/builder`)}
            />
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
              <Button danger icon={<Trash2 size={15} />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="card !p-4 md:!p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-Main dark:text-white">
              فرایندها
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              طراحی و مدیریت گردش کار درخواست‌ها
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input.Search
              allowClear
              placeholder="جستجوی نام فرایند"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 220 }}
            />
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsCreateOpen(true)}
            >
              فرایند جدید
            </Button>
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
          loading={listQuery.isLoading || listQuery.isFetching}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ emptyText: "فرایندی برای نمایش وجود ندارد" }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <Modal
        open={isCreateOpen}
        title="ایجاد فرایند جدید"
        okText="ایجاد و ورود به فرایندساز"
        cancelText="انصراف"
        confirmLoading={createMutation.isPending}
        onOk={handleCreate}
        onCancel={() => {
          setIsCreateOpen(false);
          setNewName("");
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">نام فرایند</label>
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
