import Modal from "../../../../components/Modal";
import { useFormDefinitionById } from "../../../../QueryServises/formsQuery";
import { Tag, Empty } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  TagOutlined,
} from "@ant-design/icons";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

// Section tab label — small gold marker + caption, like a filing tab
const SectionLabel = ({ children }) => (
  <div className="mb-2 flex items-center gap-2">
    <span className="h-3 w-[3px] rounded-full bg-[#B08D57]" />
    <span className="text-[11px] font-bold tracking-wide text-slate-500">
      {children}
    </span>
  </div>
);

// A "fill in the blank" row: label ...... value, like a paper form
const LeaderRow = ({ icon, label, value }) => (
  <div className="flex items-baseline gap-2 py-1.5">
    <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-slate-500">
      {icon}
      {label}
    </span>
    <span className="mb-[3px] flex-1 border-b border-dotted border-slate-300" />
    <span
      className="shrink-0 text-[13px] font-bold text-slate-800"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {value}
    </span>
  </div>
);

const FormDefinitionCategoryDetail = ({
  modalData,
  isOpen,
  closeModal,
  modalMode,
}) => {
  const { data, isPending } = useFormDefinitionById(modalData);
  const form = Array.isArray(data) ? data[0] : data;

  return (
    <Modal
      mode={modalMode}
      className="scroll-modal"
      destroyOnClose
      size={520}
      isOpen={isOpen}
      onClose={closeModal}
      footer={null}
      loading={isPending}
      title="جزئیات فرم"
    >
      {!form ? (
        <div className="flex h-64 items-center justify-center">
          <Empty description="اطلاعاتی یافت نشد" />
        </div>
      ) : (
        <div dir="rtl" className="flex flex-col pb-2">
          {/* Letterhead */}
          <div className="relative overflow-visible rounded-t-2xl">
            <div
              className="relative overflow-hidden rounded-t-2xl px-5 pb-7 pt-5"
              style={{
                background:
                  "linear-gradient(135deg, #17233F 0%, #24365C 100%)",
              }}
            >
              {/* subtle guilloché security-paper texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
                }}
              />
              <div className="relative min-w-0">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-indigo-200/70">
                  <FileTextOutlined />
                  <span>سند اطلاعات فرم</span>
                </div>
                <h3 className="truncate text-xl font-bold text-white">
                  {form.name || "بدون عنوان"}
                </h3>
                {form.description && (
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-indigo-100/70">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
            {/* gold edge rule */}
            <div
              className="h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #B08D57 15%, #B08D57 85%, transparent)",
              }}
            />
            {/* approval stamp */}
            <div className="absolute -bottom-7 left-5 z-10">
              <div
                className={`flex h-16 w-16 rotate-[-12deg] items-center justify-center rounded-full border-2 bg-white shadow-md ${
                  form.is_active
                    ? "border-red-700/80 text-red-700"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                <div
                  className={`flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full border ${
                    form.is_active ? "border-red-700/60" : "border-slate-300"
                  }`}
                >
                  {form.is_active ? (
                    <CheckCircleFilled className="text-sm" />
                  ) : (
                    <CloseCircleFilled className="text-sm" />
                  )}
                  <span className="mt-0.5 text-[9px] font-bold leading-none">
                    {form.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document reference strip */}
          <div
            className="flex items-center justify-between border-b border-dashed border-slate-200 bg-slate-50/70 px-5 py-2.5 pt-9 text-[11px] text-slate-400"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span>
              شماره سند:{" "}
              <b className="text-slate-600">
                {form.id ?? modalData ?? "—"}
              </b>
            </span>
            <span>
              نسخه: <b className="text-slate-600">v{form.version ?? 1}</b>
            </span>
          </div>

          <div className="flex flex-col gap-5 px-5 pt-4">
            {/* General info */}
            <div>
              <SectionLabel>اطلاعات کلی</SectionLabel>
              <div className="rounded-xl border border-slate-100 px-3">
                {form.category && (
                  <LeaderRow
                    icon={<TagOutlined className="text-slate-400" />}
                    label="دسته‌بندی"
                    value={form.category.name}
                  />
                )}
                <LeaderRow
                  icon={<UserOutlined className="text-slate-400" />}
                  label="ایجاد شده توسط"
                  value={
                    form.created_by?.name
                      ? `${form.created_by.name} ${form.created_by.last_name || ""}`
                      : "—"
                  }
                />
                <LeaderRow
                  label="حداکثر ارسال"
                  value={
                    form.max_submissions > 0 ? form.max_submissions : "نامحدود"
                  }
                />
              </div>
            </div>

            {/* Settings */}
            <div>
              <SectionLabel>تنظیمات</SectionLabel>
              <div className="rounded-xl border border-slate-100 px-3">
                <LeaderRow
                  icon={<ClockCircleOutlined className="text-slate-400" />}
                  label="ذخیره خودکار"
                  value={
                    form.enable_auto_save
                      ? `فعال · هر ${form.auto_save_interval} ثانیه`
                      : "غیرفعال"
                  }
                />
                <LeaderRow
                  icon={<CalendarOutlined className="text-slate-400" />}
                  label="تاریخ بسته شدن"
                  value={formatDate(form.close_date)}
                />
              </div>
            </div>

            {/* History */}
            <div>
              <SectionLabel>تاریخچه سند</SectionLabel>
              <div className="rounded-xl border border-slate-100 px-3">
                <LeaderRow
                  icon={<CalendarOutlined className="text-slate-400" />}
                  label="تاریخ ایجاد"
                  value={formatDate(form.created_at)}
                />
                <LeaderRow
                  icon={<CalendarOutlined className="text-slate-400" />}
                  label="آخرین به‌روزرسانی"
                  value={formatDate(form.updated_at)}
                />
              </div>
            </div>

            {/* Success message */}
            {form.success_message && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircleFilled />
                  پیام موفقیت
                </div>
                <p className="text-sm text-emerald-800">
                  {form.success_message}
                </p>
              </div>
            )}

            {/* Groups / access */}
            {(form.submit_groups?.length > 0 ||
              form.view_groups?.length > 0) && (
              <div>
                <SectionLabel>دسترسی‌ها</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-2 text-[11px] font-semibold text-slate-400">
                      گروه‌های ارسال
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.submit_groups?.length > 0 ? (
                        form.submit_groups.map((g) => (
                          <Tag
                            key={g.id}
                            className="!rounded-full !border-[#17233F]/20 !bg-[#17233F]/5 !text-[#17233F]"
                          >
                            {g.name}
                          </Tag>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-semibold text-slate-400">
                      گروه‌های مشاهده
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.view_groups?.length > 0 ? (
                        form.view_groups.map((g) => (
                          <Tag
                            key={g.id}
                            className="!rounded-full !border-[#17233F]/20 !bg-[#17233F]/5 !text-[#17233F]"
                          >
                            {g.name}
                          </Tag>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* footer note */}
            <div className="mt-1 border-t border-dashed border-slate-200 pt-3 text-center text-[10px] text-slate-300">
              این سند به‌صورت خودکار از سامانه فرم‌ساز تولید شده است
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FormDefinitionCategoryDetail;