import { useMemo } from "react";
import { Alert, Empty, Skeleton, Tag } from "antd";
import {
  ClockCircleOutlined,
  FileDoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import { flattenFields } from "@/pages/Forms/FormRuntime/submission";
import { useFormDefinitionFieldById } from "@/QueryServises/formsQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import Modal from "../../../components/Modal";


const parseFormData = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object")
    return Array.isArray(raw) || !Object.keys(raw).length ? null : raw;

  try {
    const parsed = JSON.parse(String(raw));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
};

const asText = (value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (Array.isArray(value))
    return value.length
      ? value
          .map((item) =>
            typeof item === "object" ? JSON.stringify(item) : item,
          )
          .join("، ")
      : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const CartableSubmissionModal = ({ open, submission, onClose }) => {
  const formDefinitionId = submission?.formDefinitionId ?? null;

  const values = useMemo(
    () => parseFormData(submission?.formData),
    [submission?.formData],
  );

  const formQuery = useFormDefinitionFieldById(formDefinitionId, {
    enabled: Boolean(open && formDefinitionId && values),
  });

  const categories = useMemo(() => {
    const data = formQuery.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return data ? [data] : [];
  }, [formQuery.data]);

  const definition = categories[0] || {};
  const fields = useMemo(() => flattenFields(categories), [categories]);

  const renderRawTable = () => {
    const labelOf = new Map(
      fields.map((field) => [
        field.field_name || String(field.id),
        field.field_label || field.field_name,
      ]),
    );

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(values || {}).map(([key, value]) => (
              <tr
                key={key}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <th className="w-1/3 bg-slate-50 p-3 text-right font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {labelOf.get(key) || key}
                </th>
                <td className="p-3 text-slate-800 dark:text-slate-100">
                  {asText(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBody = () => {
    if (!submission)
      return (
        <Empty
          className="py-16"
          description="رسیدی برای نمایش انتخاب نشده است."
        />
      );

    if (!values)
      return (
        <Empty
          className="py-16"
          description="مقادیر این ارسال در این مرورگر ذخیره نشده است؛ رسیدهای بعدی کامل نمایش داده می‌شوند."
        />
      );

    if (formQuery.isLoading)
      return <Skeleton active paragraph={{ rows: 10 }} />;

    if (formQuery.isError || !fields.length)
      return (
        <>
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message={getApiErrorMessage(
              formQuery.error,
              "قالب فرم در دسترس نیست؛ فقط مقادیر ثبت‌شده نمایش داده می‌شود.",
            )}
          />
          {renderRawTable()}
        </>
      );

    return (
      <FormRenderer
        key={`${formDefinitionId}-${submission?.submissionId ?? submission?.sentAt}`}
        categories={categories}
        mode="view"
        initialValues={values}
      />
    );
  };

  return (
    <Modal
      isOpen={open}
      size="min(1100px, 96vw)"
      onClose={onClose}
      destroyOnClose
      footer={null}
      title={
        <div className="flex w-full flex-col gap-1">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <FileDoneOutlined className="text-orange-500" />
            {submission?.formName || definition.name || "فرم ثبت‌شده"}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs font-normal text-slate-500">
            {submission?.processName ? (
              <Tag color="geekblue">{submission.processName}</Tag>
            ) : null}
            {submission?.stateName ? (
              <Tag color="green">{submission.stateName}</Tag>
            ) : null}
            <Tag icon={<UserOutlined />} color="blue">
              {submission?.submitterName ||
                (submission?.submitterId
                  ? `#${submission.submitterId}`
                  : "ثبت به‌نام ادمین")}
            </Tag>
            {submission?.sentAt ? (
              <Tag icon={<ClockCircleOutlined />} color="purple">
                {georgianDateTimeToJalaliDateTime(submission.sentAt)}
              </Tag>
            ) : null}
            {submission?.submissionId ? (
              <Tag>شماره ثبت: {submission.submissionId}</Tag>
            ) : null}
          </span>
        </div>
      }
    >
      {renderBody()}
    </Modal>
  );
};

export default CartableSubmissionModal;
