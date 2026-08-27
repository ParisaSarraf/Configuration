import Modal from "../../../../components/Modal";
import { useFormDefinitionById } from "../../../../QueryServises/formsQuery";
import { Tag, Divider, Empty } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  TeamOutlined,
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

// Small stat block used in the top summary strip
const StatItem = ({ icon, label, value }) => (
  <div className="flex flex-1 items-center gap-2.5 px-4 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className="truncate text-sm font-semibold text-gray-800">
        {value}
      </div>
    </div>
  </div>
);

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="text-gray-400">{icon}</span>
      {label}
    </div>
    <div className="text-sm font-medium text-gray-800">{children}</div>
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
      loading={isPending}
      title="جزئیات فرم"
    >
      {!form ? (
        <div className="flex h-64 items-center justify-center">
          <Empty description="اطلاعاتی یافت نشد" />
        </div>
      ) : (
        <div dir="rtl" className="flex flex-col gap-5 pb-2">
          {/* Header */}
          <div className="rounded-2xl bg-gradient-to-l from-indigo-500 to-indigo-400 p-5 text-white shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-xs text-indigo-100">
                  <FileTextOutlined />
                </div>
                <h3 className="truncate text-lg font-bold leading-snug">
                  {form.name || "بدون عنوان"}
                </h3>
              </div>
              <Tag
                icon={
                  form.is_active ? <CheckCircleFilled /> : <CloseCircleFilled />
                }
                color={form.is_active ? "success" : "error"}
                className="!m-0 shrink-0 rounded-full border-0 px-3 py-1 font-medium"
              >
                {form.is_active ? "فعال" : "غیرفعال"}
              </Tag>
            </div>
            {form.description && (
              <p className="mt-3 line-clamp-2 text-sm text-indigo-50/90">
                {form.description}
              </p>
            )}
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60">
            <StatItem
              icon={<TeamOutlined />}
              label="نسخه"
              value={`v${form.version ?? 1}`}
            />
            <StatItem
              icon={<SaveOutlined />}
              label="حداکثر ارسال"
              value={
                form.max_submissions > 0 ? form.max_submissions : "نامحدود"
              }
            />
          </div>

          {/* Category */}
          {form.category && (
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <TagOutlined />
                دسته‌بندی
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  {form.category.name}
                </span>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="rounded-2xl border border-gray-100 px-4">
            <div className="divide-y divide-gray-100">
              <InfoRow icon={<UserOutlined />} label="ایجاد شده توسط">
                {form.created_by?.name
                  ? `${form.created_by.name} ${form.created_by.last_name || ""}`
                  : "—"}
              </InfoRow>

              <InfoRow icon={<ClockCircleOutlined />} label="ذخیره‌ خودکار">
                {form.enable_auto_save ? (
                  <span className="text-emerald-600">
                    فعال · هر {form.auto_save_interval} ثانیه
                  </span>
                ) : (
                  <span className="text-gray-400">غیرفعال</span>
                )}
              </InfoRow>

              <InfoRow icon={<CalendarOutlined />} label="تاریخ بسته شدن">
                {formatDate(form.close_date)}
              </InfoRow>

              <InfoRow icon={<CalendarOutlined />} label="تاریخ ایجاد">
                {formatDate(form.created_at)}
              </InfoRow>

              <InfoRow icon={<CalendarOutlined />} label="آخرین به‌روزرسانی">
                {formatDate(form.updated_at)}
              </InfoRow>
            </div>
          </div>

          {/* Success message */}
          {form.success_message && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircleFilled />
                پیام موفقیت
              </div>
              <p className="text-sm text-emerald-800">{form.success_message}</p>
            </div>
          )}

          {/* Groups */}
          {(form.submit_groups?.length > 0 || form.view_groups?.length > 0) && (
            <>
              <Divider className="!my-1" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-2 text-xs font-semibold text-gray-400">
                    گروه‌های ارسال
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.submit_groups?.length > 0 ? (
                      form.submit_groups.map((g) => (
                        <Tag key={g.id} className="rounded-full">
                          {g.name}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold text-gray-400">
                    گروه‌های مشاهده
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.view_groups?.length > 0 ? (
                      form.view_groups.map((g) => (
                        <Tag key={g.id} className="rounded-full">
                          {g.name}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default FormDefinitionCategoryDetail;
