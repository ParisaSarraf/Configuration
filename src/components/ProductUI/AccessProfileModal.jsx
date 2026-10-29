import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Modal, Spin } from "antd";
import {
  CheckOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./access-profile.css";

const normalizeSearch = (value = "") => String(value)
  .replace(/ي/g, "ی")
  .replace(/ك/g, "ک")
  .replace(/[\u064B-\u065F\u0670]/g, "")
  .replace(/[\s\u200c]+/g, " ")
  .trim()
  .toLocaleLowerCase("fa");

const formatCount = (value) => value.toLocaleString("fa-IR");

// Keep the complete API label; only separate its existing path for readability.
const PermissionItem = ({ permission }) => {
  const label = permission.name || permission.codename || "مجوز بدون عنوان";
  const parts = label.split(/\s+-\s+/).filter(Boolean);
  const title = parts.pop() || label;
  return (
    <li className="pw-access-permission">
      <span className="pw-access-check" aria-hidden="true"><CheckOutlined /></span>
      <div className="pw-access-permission-copy">
        {parts.length > 0 && <p className="pw-access-path">{parts.join(" / ")}</p>}
        <p className="pw-access-permission-title">{title}</p>
      </div>
    </li>
  );
};

const AccessProfileModal = ({
  open,
  onClose,
  accessList,
  loading = false,
  error = false,
  onRetry,
  productName,
  themeVariables,
}) => {
  const [search, setSearch] = useState("");
  useEffect(() => { if (open) setSearch(""); }, [open]);

  const roles = Array.isArray(accessList?.roles) ? accessList.roles : [];
  const permissions = Array.isArray(accessList?.permissions) ? accessList.permissions : [];
  const filteredPermissions = useMemo(() => {
    const query = normalizeSearch(search);
    return permissions.filter((permission) => normalizeSearch(
      `${permission.name || ""} ${permission.codename || ""}`,
    ).includes(query));
  }, [permissions, search]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={860}
      className="pw-access-dialog"
      style={themeVariables}
      title={(
        <div className="pw-access-heading" dir="rtl">
          <span className="pw-access-heading-icon" aria-hidden="true"><SafetyCertificateOutlined /></span>
          <div className="pw-access-heading-copy">
            <h2>پروفایل دسترسی</h2>
            <p>{productName || "محصول"} · سمت‌ها و مجوزهای شما</p>
          </div>
        </div>
      )}
      footer={(
        <div className="pw-access-footer" dir="rtl">
          <span><LockOutlined aria-hidden="true" /> فقط نمایش دسترسی‌ها</span>
          <Button onClick={onClose}>بستن</Button>
        </div>
      )}
    >
      <div className="pw-access-body" dir="rtl">
        {loading ? (
          <div className="pw-access-state" role="status"><Spin /><p>در حال دریافت دسترسی‌ها…</p></div>
        ) : error ? (
          <div className="pw-access-error">
            <Alert type="error" showIcon message="دریافت دسترسی‌ها انجام نشد" description="لطفاً دوباره تلاش کنید."
              action={onRetry ? <Button onClick={onRetry}>تلاش مجدد</Button> : undefined} />
          </div>
        ) : (
          <>
            <section className="pw-access-roles" aria-labelledby="pw-access-roles-title">
              <div className="pw-access-section-heading">
                <h3 id="pw-access-roles-title"><TeamOutlined aria-hidden="true" /> سمت‌های این محصول</h3>
                <span className="pw-access-count">{formatCount(roles.length)} سمت</span>
              </div>
              {roles.length ? (
                <ul className="pw-access-role-list">{roles.map((role, index) => (
                  <li key={role.id ?? index}>{role.name}</li>
                ))}</ul>
              ) : <p className="pw-access-muted">سمتی برای شما در این محصول تعریف نشده است.</p>}
            </section>
            <section className="pw-access-permissions" aria-labelledby="pw-access-permissions-title">
              <div className="pw-access-section-heading">
                <h3 id="pw-access-permissions-title">لیست مجوزها</h3>
                <span className="pw-access-count">{formatCount(permissions.length)} مجوز</span>
              </div>
              <Input
                className="pw-access-search"
                prefix={<SearchOutlined aria-hidden="true" />}
                placeholder="جست‌وجو در مجوزها…"
                aria-label="جست‌وجو در مجوزها"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                allowClear
              />
              <p className="pw-access-result" role="status" aria-live="polite">
                {search.trim() ? `${formatCount(filteredPermissions.length)} نتیجه از ${formatCount(permissions.length)} مجوز` : "مجوزهای اختصاص‌یافته به شما در این محصول"}
              </p>
              {filteredPermissions.length ? (
                <ul className="pw-access-permission-list" tabIndex={0} aria-label="مجوزهای دسترسی">
                  {filteredPermissions.map((permission, index) => (
                    <PermissionItem key={permission.codename ?? permission.id ?? index} permission={permission} />
                  ))}
                </ul>
              ) : (
                <div className="pw-access-state pw-access-state--empty">
                  <SearchOutlined aria-hidden="true" />
                  <p>{permissions.length ? "مجوزی با این عبارت پیدا نشد" : "مجوزی برای شما ثبت نشده است"}</p>
                  {permissions.length > 0 && <Button onClick={() => setSearch("")}>پاک کردن جست‌وجو</Button>}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AccessProfileModal;
