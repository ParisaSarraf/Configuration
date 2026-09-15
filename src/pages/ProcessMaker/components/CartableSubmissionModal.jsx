import { useMemo } from "react";
import { Alert, Empty, Skeleton, Space, Tag } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PartitionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FormRenderer from "@/pages/Forms/FormRuntime/FormRenderer";
import { flattenFields } from "@/pages/Forms/FormRuntime/submission";
import {
  useFormDefinitionFieldById,
  useFormDefinitions,
  useFormDefinitionsWithFields,
  useFormSubmisionById,
} from "@/QueryServises/formsQuery";
import {
  asArray,
  categoriesOf,
  findFormIdBySubmission,
  firstItem,
  hydrateValues,
} from "@/Services/forms/submissionView";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import Modal from "../../../components/Modal";
import "./cartable-form-view.css";

const attachmentName = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item.split("/").pop();
  const raw =
    item.name ??
    item.file_name ??
    item.file ??
    item.attachment ??
    item.url ??
    "";
  return String(raw).split("/").pop();
};

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

/**
 * نمایش «فرم پرشده» در بخش ارسال‌شده‌های کارتابل.
 *
 * مسیر داده دقیقاً معکوس مسیر پرکردن فرم است و کاملاً سمت سرور:
 *   /workflow/get-request/  →  process.form_definition  →  /forms/get-form-definition/<id>
 *   → همان FormRenderer با mode="view" و initialValues
 *
 * هیچ مقداری در مرورگر ذخیره نمی‌شود؛ پاک کردن کش روی داده اثری ندارد.
 */
const CartableSubmissionModal = ({ open, record, submission, onClose }) => {
  const row = record ?? submission ?? null;
  const submissionId = row?.submissionId ?? row?.id ?? null;

  // اگر ردیف از فهرست درخواست‌ها آمده باشد، form_data همراهش هست
  const needsDetail = Boolean(open && submissionId && !row?.formData);
  const detailQuery = useFormSubmisionById(submissionId, {
    enabled: needsDetail,
  });
  const detail = useMemo(() => firstItem(detailQuery.data), [detailQuery.data]);

  const formData = row?.formData ?? detail?.form_data ?? null;
  const submitter = row?.submitter ?? detail?.submitter ?? null;
  const createdAt = row?.createdAt ?? detail?.created_at ?? null;
  const attachments = useMemo(() => {
    const list = row?.attachments?.length
      ? row.attachments
      : (detail?.file_attachments ?? []);
    return Array.isArray(list) ? list : [];
  }, [row?.attachments, detail?.file_attachments]);

  // شناسهٔ فرم در حالت عادی از process.form_definition خودِ درخواست می‌آید
  const linkedFormId = row?.formDefinitionId ?? null;

  // ارسال‌های قدیمی که به درخواست وصل نیستند: فرمشان از سرور پیدا می‌شود
  const needsLookup = Boolean(open && submissionId && !linkedFormId);
  const definitionsQuery = useFormDefinitions({ enabled: needsLookup });
  const definitionIds = useMemo(() => {
    if (!needsLookup) return [];
    return asArray(definitionsQuery.data)
      .map((item) => item?.id)
      .filter(Boolean);
  }, [needsLookup, definitionsQuery.data]);

  const lookupQueries = useFormDefinitionsWithFields(definitionIds);
  const lookupLoading =
    needsLookup &&
    (definitionsQuery.isLoading ||
      lookupQueries.some((query) => query.isLoading));
  const lookupFormId = findFormIdBySubmission(
    lookupQueries.map((query) => query.data),
    submissionId,
  );

  const formDefinitionId = linkedFormId ?? lookupFormId ?? null;

  const formQuery = useFormDefinitionFieldById(formDefinitionId, {
    enabled: Boolean(open && formDefinitionId),
  });

  // همان ساختاری که موقع پرکردن فرم به FormRenderer داده می‌شود
  const categories = useMemo(
    () => categoriesOf(formQuery.data),
    [formQuery.data],
  );
  const definition = categories[0] ?? null;
  const fields = useMemo(() => flattenFields(categories), [categories]);
  const values = useMemo(
    () => hydrateValues(fields, formData),
    [fields, formData],
  );

  const filledCount = row?.fieldCount ?? Object.keys(formData ?? {}).length;

  const title = (
    <Space size={6} wrap>
      <span className="font-bold">
        {definition?.name || `جزئیات ارسال #${submissionId ?? "—"}`}
      </span>
      {submissionId ? <Tag color="blue">ارسال #{submissionId}</Tag> : null}
      {row?.processName ? (
        <Tag icon={<PartitionOutlined />} color="geekblue">
          {row.processName}
        </Tag>
      ) : null}
      {row?.stateName ? <Tag color="purple">{row.stateName}</Tag> : null}
      <Tag icon={<UserOutlined />}>
        {submitter?.name || submitter?.username || "نامشخص"}
      </Tag>
      <Tag icon={<ClockCircleOutlined />}>{jalali(createdAt)}</Tag>
      <Tag icon={<FileTextOutlined />}>{filledCount} فیلد تکمیل‌شده</Tag>
    </Space>
  );

  const renderBody = () => {
    if (!row) return <Empty description="رسیدی برای نمایش انتخاب نشده است." />;

    if (needsDetail && detailQuery.isLoading)
      return <Skeleton active paragraph={{ rows: 8 }} />;

    if (needsDetail && detailQuery.isError)
      return (
        <Alert
          type="error"
          showIcon
          message="دریافت جزئیات این ارسال انجام نشد."
          description={getApiErrorMessage(detailQuery.error)}
        />
      );

    if (lookupLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

    if (!formDefinitionId)
      return (
        <Alert
          type="warning"
          showIcon
          message="فرم این ارسال روی سرور مشخص نیست."
          description="این رکورد به هیچ درخواست فرایندی وصل نیست؛ برای ارسال‌های جدید که از کارتابل فرستاده می‌شوند، فرم خودبه‌خود بازسازی می‌شود."
        />
      );

    if (formQuery.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

    if (formQuery.isError)
      return (
        <Alert
          type="error"
          showIcon
          message="دریافت ساختار فرم انجام نشد."
          description={getApiErrorMessage(formQuery.error)}
        />
      );

    if (!fields.length) return <Empty description="این فرم هیچ فیلدی ندارد." />;

    return (
      <div className="flex flex-col gap-3">
        {attachments.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <PaperClipOutlined />
            <span className="font-semibold">پیوست‌ها:</span>
            {attachments.map((item, index) => (
              <Tag key={`${attachmentName(item)}-${index}`}>
                {attachmentName(item) || `پیوست ${index + 1}`}
              </Tag>
            ))}
          </div>
        ) : null}

        <div className="cartable-form-view">
          <FormRenderer
            key={`submission-${submissionId}-form-${formDefinitionId}`}
            categories={categories}
            mode="view"
            initialValues={values}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="min(1240px, 98vw)"
      destroyOnClose
      footer={null}
    >
      {renderBody()}
    </Modal>
  );
};

export default CartableSubmissionModal;
