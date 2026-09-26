import {
  Button,
  Checkbox,
  Collapse,
  Empty,
  Form,
  Input,
  message,
  Spin,
  Tag,
} from "antd";
import {
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useRoleList } from "../../../QueryServises/roleQuery";
import { usePermissionList } from "../../../QueryServises/PermissionQuery";
import {
  useCreateRolePermission,
  usePutRolePermission,
  useRolePermissionById,
} from "../../../QueryServises/role&permission";

const normalizePermissionGroups = (permissionData) => {
  const source = Array.isArray(permissionData)
    ? permissionData
    : permissionData
      ? [permissionData]
      : [];

  // سازگاری با پاسخ جدید گروه‌بندی‌شده و پاسخ تخت قدیمی.
  if (source.some((item) => Array.isArray(item?.permissions))) {
    return source
      .filter((item) => Array.isArray(item?.permissions))
      .map((item, index) => ({
        key: `${item.category || "category"}-${index}`,
        category: item.category || "سایر دسترسی‌ها",
        permissions: item.permissions.filter(
          (permission) => permission?.id != null,
        ),
      }));
  }

  const grouped = new Map();
  source.forEach((permission) => {
    if (permission?.id == null) return;
    const category = permission.category || "سایر دسترسی‌ها";
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(permission);
  });

  return Array.from(grouped, ([category, permissions], index) => ({
    key: `${category}-${index}`,
    category,
    permissions,
  }));
};

const extractRolePermissionIds = (rolePermissionData) => {
  const source = rolePermissionData?.permissions ?? rolePermissionData ?? [];
  if (!Array.isArray(source)) return [];

  return source
    .flatMap((item) =>
      Array.isArray(item?.permissions) ? item.permissions : [item],
    )
    .map((permission) => permission?.id)
    .filter((id) => id != null)
    .map(String);
};

const PermissionManager = ({ selectedRoleId, refetch }) => {
  const [targetKeys, setTargetKeys] = useState([]);
  const [initialKeys, setInitialKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: roleData } = useRoleList();
  const { data: permissionData, isLoading: isFetchingPermission } =
    usePermissionList();
  const {
    data: rolePermissionData,
    refetch: refetchRolePermission,
    isFetching: isFetchingRolePermission,
  } = useRolePermissionById(selectedRoleId, { enabled: !!selectedRoleId });

  const { mutateAsync: addPermissions, isLoading: isAdding } =
    useCreateRolePermission();
  const { mutateAsync: updatePermissions, isLoading: isUpdating } =
    usePutRolePermission();

  const permissionGroups = useMemo(
    () => normalizePermissionGroups(permissionData),
    [permissionData],
  );

  const selectedRoleName =
    roleData?.find((role) => String(role.id) === String(selectedRoleId))
      ?.name || "سمت انتخاب‌شده";

  const selectedKeySet = useMemo(() => new Set(targetKeys), [targetKeys]);

  const filteredGroups = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("fa");
    if (!query) return permissionGroups;

    return permissionGroups
      .map((group) => {
        const categoryMatches = group.category
          .toLocaleLowerCase("fa")
          .includes(query);
        const permissions = categoryMatches
          ? group.permissions
          : group.permissions.filter((permission) =>
              `${permission.name || ""} ${permission.codename || ""}`
                .toLocaleLowerCase("fa")
                .includes(query),
            );
        return { ...group, permissions };
      })
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, searchText]);

  useEffect(() => {
    setTargetKeys([]);
    setInitialKeys([]);
    setExpandedKeys([]);
    setSearchText("");
    setIsEditing(false);
    if (selectedRoleId) refetchRolePermission();
  }, [selectedRoleId, refetchRolePermission]);

  useEffect(() => {
    const permissionIds = extractRolePermissionIds(rolePermissionData);
    const rolePermissionSet = new Set(permissionIds);
    const groupsWithSelectedPermissions = permissionGroups
      .filter((group) =>
        group.permissions.some((permission) =>
          rolePermissionSet.has(String(permission.id)),
        ),
      )
      .map((group) => group.key);

    setIsEditing(permissionIds.length > 0);
    setTargetKeys(permissionIds);
    setInitialKeys(permissionIds);
    setExpandedKeys(
      groupsWithSelectedPermissions.length
        ? groupsWithSelectedPermissions
        : permissionGroups[0]
          ? [permissionGroups[0].key]
          : [],
    );
  }, [rolePermissionData, permissionGroups]);

  const syncSelection = (nextKeys) => {
    const uniqueKeys = [...new Set(nextKeys.map(String))];
    setTargetKeys(uniqueKeys);
  };

  const handlePermissionChange = (permissionId, checked) => {
    const key = String(permissionId);
    syncSelection(
      checked
        ? [...targetKeys, key]
        : targetKeys.filter((selectedKey) => selectedKey !== key),
    );
  };

  const handleGroupChange = (group, checked) => {
    const groupKeys = group.permissions.map((permission) =>
      String(permission.id),
    );
    const groupKeySet = new Set(groupKeys);

    syncSelection(
      checked
        ? [...targetKeys, ...groupKeys]
        : targetKeys.filter((key) => !groupKeySet.has(key)),
    );
  };

  const handleReset = () => {
    syncSelection(initialKeys);
    setSearchText("");
  };

  const onFinish = async () => {
    const permissionIds = targetKeys.map(Number);

    try {
      if (isEditing) {
        await updatePermissions({
          roleId: selectedRoleId,
          permissions_ids: permissionIds,
        });
        message.success("دسترسی‌ها با موفقیت به‌روزرسانی شد");
      } else {
        await addPermissions({
          roles_ids: [selectedRoleId],
          permissions_ids: permissionIds,
        });
        message.success("دسترسی‌ها با موفقیت اضافه شدند");
      }

      setInitialKeys(targetKeys);
      setIsEditing(permissionIds.length > 0);
      await refetchRolePermission();
      refetch();
    } catch (error) {
      message.error(error?.response?.data?.detail || "خطا در ذخیره دسترسی‌ها");
    }
  };

  if (!selectedRoleId) {
    return (
      <div className="lg:col-span-2 flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <SafetyCertificateOutlined className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-800">
            مدیریت مجوزها
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty description="برای مشاهده و مدیریت دسترسی‌ها، ابتدا یک سمت را انتخاب کنید." />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-sky-600" />
            <h2 className="text-base font-semibold text-slate-800">
              دسترسی‌های سمت
            </h2>
            <Tag color="blue" className="!m-0">
              {selectedRoleName}
            </Tag>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Tag color="cyan" className="!m-0">
              {targetKeys.length} دسترسی انتخاب‌شده
            </Tag>
            <Tag className="!m-0">{permissionGroups.length} گروه</Tag>
          </div>
        </div>
        <p className="mb-0 mt-2 text-sm text-slate-500">
          هر گروه را باز کنید تا دسترسی‌های زیرمجموعه و وضعیت انتخاب آن‌ها را
          ببینید.
        </p>
      </div>

      <div className="flex-1 p-4">
        <Form layout="vertical" onFinish={onFinish}>
          <Input
            allowClear
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="جستجو در نام گروه، دسترسی یا کد دسترسی"
            className="mb-4"
          />

          {isFetchingPermission || isFetchingRolePermission ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spin tip="در حال دریافت دسترسی‌ها..." />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Empty description="دسترسی‌ای پیدا نشد" />
            </div>
          ) : (
            <div className="max-h-[56vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
              <Collapse
                activeKey={expandedKeys}
                onChange={(keys) =>
                  setExpandedKeys(Array.isArray(keys) ? keys : [keys])
                }
                bordered={false}
                className="permission-groups !bg-transparent"
              >
                {filteredGroups.map((group) => {
                  const groupPermissionKeys = group.permissions.map(
                    (permission) => String(permission.id),
                  );
                  const selectedCount = groupPermissionKeys.filter((key) =>
                    selectedKeySet.has(key),
                  ).length;
                  const allSelected =
                    groupPermissionKeys.length > 0 &&
                    selectedCount === groupPermissionKeys.length;
                  const partiallySelected = selectedCount > 0 && !allSelected;

                  return (
                    <Collapse.Panel
                      key={group.key}
                      header={
                        <div className="flex w-full items-center justify-between gap-3 pl-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <FolderOpenOutlined className="shrink-0 text-sky-600" />
                            <span className="truncate font-semibold text-slate-800">
                              {group.category}
                            </span>
                          </div>
                          <div
                            className="flex shrink-0 items-center gap-2"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Tag
                              color={selectedCount ? "blue" : "default"}
                              className="!m-0"
                            >
                              {selectedCount} از {groupPermissionKeys.length}
                            </Tag>
                            <Checkbox
                              checked={allSelected}
                              indeterminate={partiallySelected}
                              onChange={(event) =>
                                handleGroupChange(group, event.target.checked)
                              }
                            >
                              انتخاب گروه
                            </Checkbox>
                          </div>
                        </div>
                      }
                      className="!mb-2 overflow-hidden !rounded-lg !border !border-slate-200 !bg-white"
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {group.permissions.map((permission) => {
                          const permissionKey = String(permission.id);
                          const checked = selectedKeySet.has(permissionKey);

                          return (
                            <label
                              key={permissionKey}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                checked
                                  ? "border-sky-300 bg-sky-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onChange={(event) =>
                                  handlePermissionChange(
                                    permission.id,
                                    event.target.checked,
                                  )
                                }
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-slate-700">
                                  {permission.name}
                                </span>
                                <span className="mt-1 block truncate font-mono text-xs text-slate-400">
                                  {permission.codename}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </Collapse.Panel>
                  );
                })}
              </Collapse>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button htmlType="button" onClick={handleReset}>
              بازنشانی
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAdding || isUpdating}
              disabled={isFetchingPermission || isFetchingRolePermission}
            >
              {isEditing ? "به‌روزرسانی دسترسی‌ها" : "ذخیره دسترسی‌ها"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PermissionManager;
