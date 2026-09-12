import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Modal from "../../../../components/Modal";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import {
  useCreateProcessPermission,
  useDeleteProcessPermission,
  useProcessInfo,
  useUpdateProcessPermission,
} from "../../../../QueryServises/workflowQuery";
import { useRoleList } from "../../../../QueryServises/roleQuery";

const NEW_ROW_ID = "__new__";

const PERMISSION_OPTIONS = [
  { value: "view", label: "مشاهده" },
  { value: "edit", label: "ویرایش" },
];

const PERMISSION_LABELS = Object.fromEntries(
  PERMISSION_OPTIONS.map((option) => [option.value, option.label]),
);

const GRANTEE_LABELS = {
  group: "گروه",
  user: "کاربر",
  role: "نقش",
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const getGranteeName = (record) =>
  record?.group?.name ||
  record?.user?.full_name ||
  record?.user?.name ||
  record?.role?.name ||
  "—";

const emptyDraft = { group: null, permission_type: "view" };

const ProccessDetailModal = ({ modalData, isOpen, closeModal }) => {
  const { message } = App.useApp();
  const processId = modalData?.id;

  const infoQuery = useProcessInfo(isOpen ? processId : undefined);
  const createMutation = useCreateProcessPermission();
  const updateMutation = useUpdateProcessPermission();
  const deleteMutation = useDeleteProcessPermission();

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const groupsQuery = useRoleList({ enabled: isOpen && isAdding });

  const process = useMemo(() => {
    const data = infoQuery.data;
    return Array.isArray(data) ? data[0] : data;
  }, [infoQuery.data]);

  const permissions = process?.process_permissions ?? [];
  const formDefinition = process?.form_definition ?? null;

  const usedGroupIds = useMemo(
    () =>
      new Set(
        permissions
          .filter((item) => item?.grantee_type === "group")
          .map((item) => String(item?.group?.id)),
      ),
    [permissions],
  );

  const groupOptions = useMemo(
    () =>
      asArray(groupsQuery.data).map((group) => ({
        value: group?.id,
        label: group?.name ?? `گروه ${group?.id}`,
        disabled: usedGroupIds.has(String(group?.id)),
      })),
    [groupsQuery.data, usedGroupIds],
  );

  const resetAll = () => {
    setEditingId(null);
    setEditingValue(null);
    setIsAdding(false);
    setDraft(emptyDraft);
  };

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditingValue(record.permission_type ?? null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue(null);
  };

  const startAdd = () => {
    cancelEdit();
    setDraft(emptyDraft);
    setIsAdding(true);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setDraft(emptyDraft);
  };

  const handleCreate = async () => {
    if (!draft.group) return message.warning("گروه را انتخاب کنید.");
    if (!draft.permission_type)
      return message.warning("سطح دسترسی را انتخاب کنید.");

    try {
      await createMutation.mutateAsync({
        process_id: processId,
        grantee_type: "group",
        group_id: draft.group,
        permission_type: draft.permission_type,
      });
      message.success("دسترسی افزوده شد.");
      cancelAdd();
      infoQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, "افزودن دسترسی انجام نشد."));
    }
  };

  const handleSave = async (record) => {
    if (!editingValue) return message.warning("سطح دسترسی را انتخاب کنید.");
    if (editingValue === record.permission_type) return cancelEdit();

    setBusyId(record.id);
    try {
      await updateMutation.mutateAsync({
        permissionId: record.id,
        processId,
        permission_type: editingValue,
        grantee_type: record.grantee_type ?? "group",
      });
      message.success("سطح دسترسی ویرایش شد.");
      cancelEdit();
      infoQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, "ویرایش دسترسی انجام نشد."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (record) => {
    setBusyId(record.id);
    try {
      await deleteMutation.mutateAsync(record.id);
      message.success("دسترسی حذف شد.");
      if (editingId === record.id) cancelEdit();
      infoQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, "حذف دسترسی انجام نشد."));
    } finally {
      setBusyId(null);
    }
  };

  const dataSource = isAdding
    ? [{ id: NEW_ROW_ID, isNew: true }, ...permissions]
    : permissions;

  const columns = [
    {
      title: "#",
      key: "index",
      width: 56,
      render: (_v, record, index) =>
        record?.isNew ? (
          <PlusOutlined className="text-blue-500" />
        ) : (
          index + (isAdding ? 0 : 1)
        ),
    },
    {
      title: "دسترسی‌دهنده",
      key: "grantee",
      render: (_v, record) =>
        record?.isNew ? (
          <Select
            autoFocus
            showSearch
            optionFilterProp="label"
            placeholder="انتخاب گروه"
            style={{ width: 220 }}
            value={draft.group}
            options={groupOptions}
            loading={groupsQuery.isLoading}
            notFoundContent={
              groupsQuery.isLoading ? "در حال بارگذاری..." : "گروهی یافت نشد"
            }
            onChange={(value) => setDraft((prev) => ({ ...prev, group: value }))}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {getGranteeName(record)}
            </span>
            <Tag>{GRANTEE_LABELS[record?.grantee_type] ?? record?.grantee_type}</Tag>
          </div>
        ),
    },
    {
      title: "سطح دسترسی",
      key: "permission_type",
      width: 200,
      render: (_v, record) => {
        if (record?.isNew) {
          return (
            <Select
              style={{ width: 160 }}
              value={draft.permission_type}
              options={PERMISSION_OPTIONS}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, permission_type: value }))
              }
            />
          );
        }
        if (editingId === record.id) {
          return (
            <Select
              autoFocus
              style={{ width: 160 }}
              value={editingValue}
              options={PERMISSION_OPTIONS}
              onChange={setEditingValue}
            />
          );
        }
        return (
          <Tag color={record?.permission_type === "edit" ? "blue" : "default"}>
            {PERMISSION_LABELS[record?.permission_type] ?? record?.permission_type ?? "—"}
          </Tag>
        );
      },
    },
    {
      title: "عملیات",
      key: "operations",
      width: 200,
      align: "left",
      render: (_v, record) => {
        if (record?.isNew) {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={createMutation.isPending}
                onClick={handleCreate}
              >
                افزودن
              </Button>
              <Button
                icon={<CloseOutlined />}
                disabled={createMutation.isPending}
                onClick={cancelAdd}
              >
                انصراف
              </Button>
            </div>
          );
        }
        if (editingId === record.id) {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={busyId === record.id && updateMutation.isPending}
                onClick={() => handleSave(record)}
              >
                ذخیره
              </Button>
              <Button icon={<CloseOutlined />} onClick={cancelEdit}>
                انصراف
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              icon={<EditOutlined />}
              disabled={Boolean(editingId) || isAdding || busyId === record.id}
              onClick={() => startEdit(record)}
            >
              ویرایش
            </Button>
            <Popconfirm
              title="حذف دسترسی"
              description="این دسترسی از فرایند حذف می‌شود."
              okText="حذف"
              cancelText="انصراف"
              okButtonProps={{
                danger: true,
                loading: busyId === record.id && deleteMutation.isPending,
              }}
              onConfirm={() => handleDelete(record)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={Boolean(editingId) || isAdding}
                loading={busyId === record.id && deleteMutation.isPending}
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="جزئیات فرآیند" footer={null}>
      <div className="flex flex-col gap-4 p-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="m-0 text-base font-bold text-slate-800 dark:text-slate-100">
              {modalData?.name || "بدون نام"}
            </h2>
            <p className="m-0 mt-1 text-xs text-slate-500">
              {permissions.length} دسترسی ثبت شده
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isAdding || Boolean(editingId)}
              onClick={startAdd}
            >
              افزودن دسترسی
            </Button>
            <Tooltip title="بارگذاری مجدد">
              <Button
                icon={<ReloadOutlined />}
                loading={infoQuery.isFetching}
                onClick={() => infoQuery.refetch()}
              />
            </Tooltip>
          </div>
        </div>

        {infoQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getApiErrorMessage(infoQuery.error, "دریافت اطلاعات فرایند انجام نشد.")}
            action={
              <Button size="small" onClick={() => infoQuery.refetch()}>
                تلاش مجدد
              </Button>
            }
          />
        ) : null}

        {formDefinition ? (
          <Descriptions
            title="فرم متصل"
            size="small"
            bordered
            column={2}
          >
            <Descriptions.Item label="نام فرم">
              {formDefinition.name || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="توضیحات">
              {formDefinition.description || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="وضعیت">
              <Tag color={formDefinition.is_active ? "green" : "default"}>
                {formDefinition.is_active ? "فعال" : "غیرفعال"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="نسخه">
              {formDefinition.version ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="سقف ثبت">
              {formDefinition.max_submissions ?? "نامحدود"}
            </Descriptions.Item>
            <Descriptions.Item label="تعداد فیلدها">
              {formDefinition.fields?.length ?? 0}
            </Descriptions.Item>
          </Descriptions>
        ) : null}

        {groupsQuery.isError && isAdding ? (
          <Alert
            type="warning"
            showIcon
            message={getApiErrorMessage(groupsQuery.error, "دریافت لیست گروه‌ها انجام نشد.")}
            action={
              <Button size="small" onClick={() => groupsQuery.refetch()}>
                تلاش مجدد
              </Button>
            }
          />
        ) : null}

        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={dataSource}
          loading={infoQuery.isLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
          rowClassName={(record) => (record?.isNew ? "bg-blue-50 dark:bg-slate-800" : "")}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center gap-2 py-8">
                <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
                  برای این فرایند دسترسی‌ای ثبت نشده است
                </p>
                <Button type="primary" icon={<PlusOutlined />} onClick={startAdd}>
                  افزودن دسترسی
                </Button>
              </div>
            ),
          }}
        />
      </div>
    </Modal>
  );
};

export default ProccessDetailModal;