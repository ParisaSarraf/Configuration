import { useEffect, useMemo, useState } from "react";
import { Alert, Collapse, Empty, Select, Skeleton, Tag } from "antd";
import {
  ClockCircleOutlined,
  FileDoneOutlined,
  PaperClipOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useFormDefinitions,
  useFormSubmisionById,
} from "@/QueryServises/formsQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import {
  guessFormDefinitionId,
  normalizeApiItem,
  readFormData,
  resolveFormDefinitionId,
} from "@/Services/forms/submissionValues";
import Modal from "../../../components/Modal";
import SubmissionFormView from "./SubmissionFormView";

const asList = (value) =>
  Array.isArray(value)
    ? value
    : Array.isArray(value?.results)
      ? value.results
      : [];

const CartableSubmissionModal = ({
  open,
  submission,
  onClose,
  formDefinitions,
}) => {
  const submissionId = submission?.id ?? null;
  const [manualFormId, setManualFormId] = useState(null);

  useEffect(() => {
    setManualFormId(null);
  }, [submissionId]);

  const submissionQuery = useFormSubmisionById(submissionId, {
    enabled: Boolean(open && submissionId),
  });

  const detail = useMemo(
    () =>
      normalizeApiItem(submissionQuery.data) ?? normalizeApiItem(submission),
    [submissionQuery.data, submission],
  );

  const formData = useMemo(() => readFormData(detail), [detail]);
  const submitter = detail?.submitter ?? null;
  const createdAt = detail?.created_at ?? null;
  const attachments = Array.isArray(detail?.file_attachments)
    ? detail.file_attachments
    : [];

  const explicitFormId = useMemo(
    () =>
      resolveFormDefinitionId(detail) ?? resolveFormDefinitionId(submission),
    [detail, submission],
  );

  const definitionsQuery = useFormDefinitions({
    enabled: Boolean(open && !explicitFormId && !formDefinitions),
  });

  const definitions = useMemo(
    () => asList(formDefinitions ?? definitionsQuery.data),
    [formDefinitions, definitionsQuery.data],
  );

  const guessedFormId = useMemo(
    () =>
      explicitFormId ? null : guessFormDefinitionId(definitions, formData),
    [explicitFormId, definitions, formData],
  );


  const formId = explicitFormId ?? guessedFormId ?? manualFormId;

  const formTitle = useMemo(() => {
    const found = definitions.find(
      (item) => Number(item?.id) === Number(formId),
    );
    return found?.name || detail?.form_title || detail?.form_name || "";
  }, [definitions, formId, detail]);

  const renderBody = () => {
    if (!submission)
      return (
        <Empty
          className="py-16"
          description="رسیدی برای نمایش انتخاب نشده است."
        />
      );

    if (submissionQuery.isLoading)
      return <Skeleton active paragraph={{ rows: 10 }} />;

    if (submissionQuery.isError)
      return (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            submissionQuery.error,
            "دریافت جزئیات این ارسال انجام نشد.",
          )}
        />
      );

    if (!Object.keys(formData).length && !attachments.length)
      return (
        <Empty
          className="py-16"
          description="مقداری برای این ارسال ثبت نشده است."
        />
      );

    return (
      <div className="space-y-4">
        {!formId ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="mb-2 text-xs leading-6 text-amber-800 dark:text-amber-200">
              پاسخ این ارسال شناسهٔ فرم ندارد و از روی کلیدها هم قابل تشخیص
              نبود. فرم مربوطه را انتخاب کنید تا همان فرم پرشده نمایش داده شود.
            </p>
            <Select
              className="w-full sm:w-80"
              placeholder="انتخاب فرم"
              value={manualFormId ?? undefined}
              onChange={setManualFormId}
              loading={definitionsQuery.isLoading}
              showSearch
              optionFilterProp="label"
              options={definitions.map((item) => ({
                value: item?.id,
                label: item?.name || `فرم #${item?.id}`,
              }))}
            />
          </div>
        ) : null}

        <SubmissionFormView
          formDefinitionId={formId}
          formData={formData}
          enabled={Boolean(open)}
        />

        {attachments.length ? (
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              پیوست‌ها
            </p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => {
                const name =
                  file?.name ||
                  file?.file_name ||
                  file?.title ||
                  `فایل ${index + 1}`;
                const href = file?.file || file?.url || file?.path || null;
                return href ? (
                  <a
                    key={file?.id ?? `${name}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Tag icon={<PaperClipOutlined />} color="gold">
                      {name}
                    </Tag>
                  </a>
                ) : (
                  <Tag
                    key={file?.id ?? `${name}-${index}`}
                    icon={<PaperClipOutlined />}
                    color="gold"
                  >
                    {name}
                  </Tag>
                );
              })}
            </div>
          </div>
        ) : null}

        <Collapse
          ghost
          size="small"
          items={[
            {
              key: "raw",
              label: (
                <span className="text-xs text-slate-500">
                  مقادیر خام ثبت‌شده (JSON)
                </span>
              ),
              children: (
                <pre className="max-h-64 overflow-auto rounded-xl bg-slate-900 p-3 text-left text-xs text-slate-100">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              ),
            },
          ]}
        />
      </div>
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
            جزئیات ارسال #{submissionId}
            {formTitle ? (
              <span className="text-xs font-normal text-slate-400">
                — {formTitle}
              </span>
            ) : null}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs font-normal text-slate-500">
            <Tag icon={<UserOutlined />} color="blue">
              {submitter?.name ||
                submitter?.username ||
                (submitter?.id ? `#${submitter.id}` : "—")}
            </Tag>
            {createdAt ? (
              <Tag icon={<ClockCircleOutlined />} color="purple">
                {georgianDateTimeToJalaliDateTime(createdAt)}
              </Tag>
            ) : null}
            {attachments.length ? (
              <Tag icon={<PaperClipOutlined />} color="gold">
                {attachments.length} پیوست
              </Tag>
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
