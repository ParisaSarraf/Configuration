import { createPermission } from "./processGraph";
import { DEFAULT_GRANTEE_TYPE, PERMISSION_TYPES } from "./processSchema";

const isGroupPermission = (permission) =>
  (permission.granteeType ?? DEFAULT_GRANTEE_TYPE) === DEFAULT_GRANTEE_TYPE;

export const getPermissionSelection = (permissions = [], options = []) => {
  const availableIds = new Set(options.map((option) => String(option.value)));
  const selectedIds = new Set(
    permissions
      .filter(
        (permission) =>
          isGroupPermission(permission) &&
          permission.groupId !== null &&
          permission.groupId !== undefined &&
          availableIds.has(String(permission.groupId)),
      )
      .map((permission) => String(permission.groupId)),
  );

  return {
    total: availableIds.size,
    selected: selectedIds.size,
    checked: availableIds.size > 0 && selectedIds.size === availableIds.size,
    indeterminate: selectedIds.size > 0 && selectedIds.size < availableIds.size,
  };
};

export const toggleAllGroupPermissions = (
  permissions = [],
  options = [],
  checked,
  withType = true,
) => {
  const availableIds = new Set(options.map((option) => String(option.value)));
  if (availableIds.size === 0) return permissions;

  if (!checked) {
    // دسترسی سمت‌های خارج از فهرست و دسترسی ایجادکننده دست‌نخورده می‌مانند.
    return permissions.filter(
      (permission) =>
        !isGroupPermission(permission) ||
        !availableIds.has(String(permission.groupId)),
    );
  }

  const selectedIds = new Set(
    permissions
      .filter(isGroupPermission)
      .filter(
        (permission) =>
          permission.groupId !== null && permission.groupId !== undefined,
      )
      .map((permission) => String(permission.groupId)),
  );
  const additions = [];

  options.forEach((option) => {
    const key = String(option.value);
    if (selectedIds.has(key)) return;
    selectedIds.add(key);
    const permission = createPermission({
      groupId: option.value,
      permissionType: PERMISSION_TYPES[0].value,
    });
    // مدل دسترسی عملیات permission_type ندارد.
    if (!withType) delete permission.permissionType;
    additions.push(permission);
  });

  // نوع و شناسه‌ی دسترسی‌های قبلی حفظ می‌شود؛ ردیف‌های خالی نیز حذف نمی‌شوند.
  return additions.length > 0 ? [...permissions, ...additions] : permissions;
};