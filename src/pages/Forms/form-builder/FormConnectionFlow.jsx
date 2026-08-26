/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Progress,
  Radio,
  Rate,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
  Upload,
} from "antd";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Database,
  FilePlus2,
  FolderPlus,
  FormInput,
  Link2,
  RefreshCw,
  Send,
} from "lucide-react";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import {
  useCreateFormCategory,
  useCreateFormDefinition,
  useCreateFormField,
  useCreateFormSubmission,
} from "../../../QueryServises/formsQuery";
import { extractEntityId, getApiErrorMessage } from "../../../Services/forms/formUtils";
import {
  readFilesAsAttachments,
  resolveValidationPattern,
  slugify,
  toCategoryPayload,
  toDefinitionPayload,
  toFieldPayload,
  toSubmissionPayload,
} from "../../../Services/forms/formPayloads";

const FLOW_STORAGE_KEY = "form-builder-api-flow-v1";

const emptyFlow = { categories: [], category: null, definition: null, syncedFields: [] };

const loadFlow = () => {
  try {
    return { ...emptyFlow, ...JSON.parse(localStorage.getItem(FLOW_STORAGE_KEY)) };
  } catch {
    return emptyFlow;
  }
};

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return undefined;
    const claims = jwtDecode(token);
    const id = Number(claims.user_id ?? claims.id ?? claims.sub);
    return Number.isFinite(id) ? id : undefined;
  } catch {
    return undefined;
  }
};

const persistFlow = (next) => {
  localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(next));
  return next;
};

const fieldFingerprint = (field, definitionId, index) => JSON.stringify(
  toFieldPayload(field, definitionId, index)
);

const fieldKey = (field, index) => slugify(field.fieldName || field.label || `field-${index + 1}`);

const normalizeUpload = (event) => Array.isArray(event) ? event : event?.fileList || [];

const submissionRules = (field) => {
  const rules = [];
  if (field.required) rules.push({ required: true, message: "پاسخ به این فیلد الزامی است." });
  if (["shortText", "longText"].includes(field.type)) {
    if (Number(field.minLength) > 0) rules.push({ min: Number(field.minLength), message: `حداقل ${field.minLength} کاراکتر وارد کنید.` });
    if (Number(field.maxLength) > 0) rules.push({ max: Number(field.maxLength), message: `حداکثر ${field.maxLength} کاراکتر مجاز است.` });
    const pattern = resolveValidationPattern(field);
    if (pattern) {
      try {
        rules.push({ pattern: new RegExp(pattern), message: field.regexErrorMessage || "فرمت مقدار واردشده معتبر نیست." });
      } catch {
        // Invalid custom patterns are still sent to the API, but must not crash the client form.
      }
    }
  }
  if (field.type === "file") {
    rules.push({
      validator: (_, files = []) => {
        const allowed = String(field.allowedExtensions || "").split(",").map((item) => item.trim().replace(/^\./, "").toLowerCase()).filter(Boolean);
        const maxBytes = Number(field.maxFileSizeMb || 0) * 1024 * 1024;
        const invalidExtension = files.find((item) => {
          const file = item.originFileObj || item;
          const extension = file.name?.split(".").pop()?.toLowerCase();
          return allowed.length && !allowed.includes(extension);
        });
        if (invalidExtension) return Promise.reject(new Error(`پسوند فایل مجاز نیست. موارد مجاز: ${allowed.join(", ")}`));
        const oversized = files.find((item) => maxBytes > 0 && (item.originFileObj || item).size > maxBytes);
        if (oversized) return Promise.reject(new Error(`حجم فایل نباید بیشتر از ${field.maxFileSizeMb} مگابایت باشد.`));
        return Promise.resolve();
      },
    });
  }
  return rules;
};

function SectionIntro({ icon: Icon, title, description }) {
  return (
    <div className="connection-section-intro">
      <span><Icon size={19} /></span>
      <div><h3>{title}</h3><p>{description}</p></div>
    </div>
  );
}

function CategoryStep({ flow, onCreated, mutation, notify }) {
  const [mode, setMode] = useState(flow.categories.length ? "select" : "create");
  const [form] = Form.useForm();

  const submit = async () => {
    const values = await form.validateFields();
    if (mode === "select") {
      const category = flow.categories.find((item) => item.id === values.category_id) || {
        id: Number(values.category_id),
        name: values.category_name || `دسته‌بندی #${values.category_id}`,
      };
      onCreated(category, flow.categories.some((item) => item.id === category.id));
      return;
    }

    try {
      const payload = toCategoryPayload(values);
      const response = await mutation.mutateAsync(payload);
      const id = extractEntityId(response);
      if (!id) throw new Error("پاسخ ایجاد دسته‌بندی شامل شناسه قابل استفاده نیست.");
      onCreated({ id, name: payload.name, slug: payload.slug }, false);
      notify.success("دسته‌بندی فرم ایجاد شد");
    } catch (error) {
      notify.error(getApiErrorMessage(error, error.message));
    }
  };

  return (
    <div>
      <SectionIntro icon={FolderPlus} title="دسته‌بندی فرم" description="یک دسته‌بندی موجود در این مرورگر را انتخاب کنید یا دسته‌بندی تازه بسازید." />
      <Radio.Group className="connection-mode-switch" optionType="button" buttonStyle="solid" value={mode} onChange={(event) => setMode(event.target.value)}>
        <Radio.Button value="create">ایجاد دسته‌بندی</Radio.Button>
        <Radio.Button value="select">انتخاب با شناسه</Radio.Button>
      </Radio.Group>

      <Form form={form} layout="vertical" requiredMark="optional" className="connection-form">
        {mode === "select" ? (
          <>
            {flow.categories.length > 0 && (
              <Form.Item name="category_picker" label="انتخاب سریع از دسته‌بندی‌های این مرورگر">
                <Select
                  showSearch
                  allowClear
                  placeholder="یکی از دسته‌بندی‌های ایجادشده"
                  options={flow.categories.map((item) => ({ value: item.id, label: `${item.name} — #${item.id}` }))}
                  onChange={(value) => form.setFieldValue("category_id", value)}
                />
              </Form.Item>
            )}
            <Form.Item name="category_id" label="شناسه دسته‌بندی موجود" rules={[{ required: true, message: "شناسه دسته‌بندی الزامی است." }]}><InputNumber min={1} className="connection-wide-control" /></Form.Item>
            <Form.Item name="category_name" label="نام نمایشی محلی"><Input placeholder="برای تشخیص بهتر در این مرورگر" /></Form.Item>
          </>
        ) : (
          <>
            <div className="connection-form-grid">
              <Form.Item name="name" label="نام" rules={[{ required: true, message: "نام دسته‌بندی الزامی است." }]}><Input onBlur={(event) => !form.getFieldValue("slug") && form.setFieldValue("slug", slugify(event.target.value))} /></Form.Item>
              <Form.Item name="slug" label="نامک" rules={[{ required: true, message: "نامک الزامی است." }]}><Input dir="ltr" /></Form.Item>
              <Form.Item name="order" label="ترتیب" initialValue={0}><InputNumber min={0} className="connection-wide-control" /></Form.Item>
              <Form.Item name="icon" label="نام آیکون"><Input dir="ltr" placeholder="folder" /></Form.Item>
            </div>
            <Form.Item name="description" label="توضیحات"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="allowed_groups" label="شناسه گروه‌های مجاز"><Select mode="tags" tokenSeparators={[",", "،"]} placeholder="مثلاً 2، 5" /></Form.Item>
            <Form.Item name="is_collapsed_by_default" valuePropName="checked" initialValue={false}><Checkbox>به‌صورت پیش‌فرض بسته باشد</Checkbox></Form.Item>
          </>
        )}
      </Form>
      <div className="connection-step-actions"><Button type="primary" loading={mutation.isPending} onClick={submit}>ادامه <ArrowLeft size={14} /></Button></div>
    </div>
  );
}

function DefinitionStep({ flow, title, description, onCreated, onBack, mutation, notify }) {
  const [form] = Form.useForm();
  const currentUserId = getCurrentUserId();

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const payload = toDefinitionPayload(values, flow.category.id);
      const response = await mutation.mutateAsync(payload);
      const id = extractEntityId(response);
      if (!id) throw new Error("پاسخ ایجاد تعریف فرم شامل شناسه قابل استفاده نیست.");
      onCreated({ id, name: payload.name, slug: payload.slug, categoryId: flow.category.id });
      notify.success("تعریف فرم با موفقیت ایجاد شد");
    } catch (error) {
      notify.error(getApiErrorMessage(error, error.message));
    }
  };

  return (
    <div>
      <SectionIntro icon={FilePlus2} title="تعریف فرم" description={`فرم را زیر دسته‌بندی «${flow.category?.name}» ایجاد کنید.`} />
      <Alert type="info" showIcon message="شناسه سازنده از توکن ورود خوانده می‌شود؛ اگر در توکن موجود نباشد آن را دستی وارد کنید." />
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        className="connection-form"
        initialValues={{
          name: title,
          slug: slugify(title),
          description,
          created_by_id: currentUserId,
          is_active: true,
          version: 1,
          close_date: dayjs().add(30, "day"),
          max_submissions: 0,
          enable_auto_save: true,
          auto_save_interval: 30,
          success_message: "پاسخ شما با موفقیت ثبت شد.",
          submit_groups: [],
          view_groups: [],
        }}
      >
        <div className="connection-form-grid">
          <Form.Item name="name" label="نام فرم" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="نامک" rules={[{ required: true }]}><Input dir="ltr" /></Form.Item>
          <Form.Item name="created_by_id" label="شناسه سازنده" rules={[{ required: true }]}><InputNumber min={1} className="connection-wide-control" /></Form.Item>
          <Form.Item name="version" label="نسخه"><InputNumber min={1} className="connection-wide-control" /></Form.Item>
          <Form.Item name="close_date" label="تاریخ بسته‌شدن" rules={[{ required: true }]}><DatePicker showTime className="connection-wide-control" /></Form.Item>
          <Form.Item name="max_submissions" label="حداکثر ارسال"><InputNumber min={0} className="connection-wide-control" /></Form.Item>
        </div>
        <Form.Item name="description" label="توضیحات"><Input.TextArea rows={3} /></Form.Item>
        <div className="connection-form-grid">
          <Form.Item name="submit_groups" label="گروه‌های مجاز ارسال"><Select mode="tags" tokenSeparators={[",", "،"]} /></Form.Item>
          <Form.Item name="view_groups" label="گروه‌های مجاز مشاهده"><Select mode="tags" tokenSeparators={[",", "،"]} /></Form.Item>
          <Form.Item name="success_message" label="پیام موفقیت"><Input /></Form.Item>
          <Form.Item name="success_redirect_url" label="آدرس هدایت"><Input dir="ltr" placeholder="https://" /></Form.Item>
        </div>
        <div className="connection-switches">
          <Form.Item name="is_active" valuePropName="checked"><Switch /> فرم فعال باشد</Form.Item>
          <Form.Item name="enable_auto_save" valuePropName="checked"><Switch /> ذخیره خودکار پاسخ</Form.Item>
          <Form.Item noStyle shouldUpdate={(before, after) => before.enable_auto_save !== after.enable_auto_save}>
            {({ getFieldValue }) => getFieldValue("enable_auto_save") && <Form.Item name="auto_save_interval" label="فاصله ذخیره خودکار (ثانیه)"><InputNumber min={1} /></Form.Item>}
          </Form.Item>
        </div>
      </Form>
      <div className="connection-step-actions"><Button onClick={onBack}><ArrowRight size={14} /> بازگشت</Button><Button type="primary" loading={mutation.isPending} onClick={submit}>ایجاد و ادامه <ArrowLeft size={14} /></Button></div>
    </div>
  );
}

function FieldsStep({ flow, fields, onSynced, onBack, mutation, notify }) {
  const [progress, setProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncedMap = new Map(flow.syncedFields.map((item) => [item.clientId, item]));
  const deletedServerFields = flow.syncedFields.filter((item) => !fields.some((field) => field.id === item.clientId));
  const changedFields = fields.filter((field, index) => {
    const synced = syncedMap.get(field.id);
    return synced && synced.fingerprint !== fieldFingerprint(field, flow.definition.id, index);
  });
  const pendingFields = fields.filter((field) => !syncedMap.has(field.id));

  const sync = async () => {
    if (!fields.length) return notify.warning("پیش از همگام‌سازی حداقل یک فیلد بسازید.");
    if (changedFields.length || deletedServerFields.length) {
      return notify.error("ساختار فیلدهای ثبت‌شده تغییر کرده است. برای جلوگیری از داده تکراری، یک تعریف فرم جدید ایجاد کنید.");
    }

    const names = fields.map(fieldKey);
    if (new Set(names).size !== names.length) return notify.error("نام فنی فیلدها باید یکتا باشد.");
    if (!pendingFields.length) return onSynced(flow.syncedFields);

    setSyncing(true);
    const completed = [...flow.syncedFields];
    try {
      for (let index = 0; index < fields.length; index += 1) {
        const field = fields[index];
        if (syncedMap.has(field.id)) continue;
        const payload = toFieldPayload(field, flow.definition.id, index);
        const response = await mutation.mutateAsync(payload);
        completed.push({
          clientId: field.id,
          fieldName: payload.field_name,
          fingerprint: fieldFingerprint(field, flow.definition.id, index),
          serverId: extractEntityId(response),
        });
        setProgress(Math.round((completed.length / fields.length) * 100));
      }
      onSynced(completed);
      notify.success("همه فیلدهای جدید به تعریف فرم متصل شدند");
    } catch (error) {
      onSynced(completed, false);
      notify.error(getApiErrorMessage(error));
    } finally {
      setSyncing(false);
    }
  };

  const isReady = fields.length > 0 && !pendingFields.length && !changedFields.length && !deletedServerFields.length;

  return (
    <div>
      <SectionIntro icon={FormInput} title="اتصال فیلدهای پویا" description={`فیلدهای بوم به ترتیب در تعریف فرم #${flow.definition?.id} ثبت می‌شوند.`} />
      {(changedFields.length > 0 || deletedServerFields.length > 0) && <Alert type="warning" showIcon message="تعریف ثبت‌شده با بوم فعلی همسان نیست" description="API معرفی‌شده endpoint ویرایش یا حذف ندارد؛ برای حفظ یکپارچگی، به مرحله قبل برگردید و نسخه جدیدی از تعریف فرم بسازید." />}
      <div className="connection-field-list">
        {fields.map((field, index) => {
          const synced = syncedMap.get(field.id);
          const changed = synced && synced.fingerprint !== fieldFingerprint(field, flow.definition.id, index);
          return (
            <div key={field.id} className="connection-field-row">
              <span>{(index + 1).toLocaleString("fa-IR")}</span>
              <div><strong>{field.label}</strong><small dir="ltr">{fieldKey(field, index)} · {field.type}</small></div>
              <Tag color={changed ? "warning" : synced ? "success" : "default"}>{changed ? "تغییر کرده" : synced ? "متصل" : "در انتظار"}</Tag>
            </div>
          );
        })}
        {!fields.length && <Empty description="هنوز فیلدی در بوم وجود ندارد" />}
      </div>
      {syncing && <Progress percent={progress} size="small" />}
      <div className="connection-step-actions">
        <Button onClick={onBack}><ArrowRight size={14} /> بازگشت</Button>
        <Space>
          <Button icon={<RefreshCw size={14} />} loading={syncing} disabled={isReady} onClick={sync}>همگام‌سازی {pendingFields.length ? `(${pendingFields.length.toLocaleString("fa-IR")})` : ""}</Button>
          <Button type="primary" disabled={!isReady} onClick={() => onSynced(flow.syncedFields)}>ادامه <ArrowLeft size={14} /></Button>
        </Space>
      </div>
    </div>
  );
}

function SubmissionControl({ field }) {
  if (field.type === "longText") return <Input.TextArea rows={3} placeholder={field.placeholder} />;
  if (field.type === "select") return <Select placeholder={field.placeholder} options={(field.options || []).map((item) => ({ label: item, value: item }))} />;
  if (field.type === "checkbox") return <Checkbox>تأیید می‌کنم</Checkbox>;
  if (field.type === "number") return <InputNumber min={field.min || undefined} max={field.max || undefined} className="connection-wide-control" />;
  if (field.type === "rating") return <Rate count={field.maxRating || 5} />;
  if (field.type === "date") return <DatePicker className="connection-wide-control" />;
  if (field.type === "file") return <Upload beforeUpload={() => false} maxCount={1}><Button icon={<CloudUpload size={14} />}>انتخاب فایل</Button></Upload>;
  return <Input placeholder={field.placeholder} maxLength={field.maxLength || undefined} />;
}

function SubmissionStep({ flow, fields, onBack, onDone, mutation, notify }) {
  const [form] = Form.useForm();
  const currentUserId = getCurrentUserId();
  const initialValues = fields.reduce((values, field, index) => {
    const key = fieldKey(field, index);
    if (field.defaultValue !== "" && field.defaultValue != null) values[key] = field.defaultValue;
    return values;
  }, { __submitterId: currentUserId });

  const submit = async () => {
    try {
      const rawValues = await form.validateFields();
      const fileMap = {};
      const values = {};
      fields.forEach((field, index) => {
        const key = fieldKey(field, index);
        if (field.type === "file") fileMap[key] = rawValues[key] || [];
        else if (field.type === "date") values[key] = rawValues[key]?.toISOString?.() || rawValues[key] || null;
        else values[key] = rawValues[key] ?? null;
      });
      const attachments = await readFilesAsAttachments(fileMap);
      const payload = toSubmissionPayload({
        formDefinitionId: flow.definition.id,
        submitterId: rawValues.__submitterId,
        values,
        attachments,
      });
      await mutation.mutateAsync(payload);
      form.resetFields();
      notify.success("پاسخ فرم با موفقیت ارسال شد");
      onDone();
    } catch (error) {
      if (error?.errorFields) return;
      notify.error(getApiErrorMessage(error, error.message));
    }
  };

  return (
    <div>
      <SectionIntro icon={Send} title="ثبت پاسخ آزمایشی" description="این فرم دقیقاً با تعریف و فیلدهای ثبت‌شده ساخته و به endpoint ارسال پاسخ متصل است." />
      <Alert type="success" showIcon message={`فرم #${flow.definition?.id} آماده دریافت پاسخ است.`} />
      <Form form={form} layout="vertical" className="connection-form connection-submission-form" initialValues={initialValues}>
        <Form.Item name="__submitterId" label="شناسه ارسال‌کننده" rules={[{ required: true, message: "شناسه ارسال‌کننده الزامی است." }]}><InputNumber min={1} className="connection-wide-control" /></Form.Item>
        <Divider />
        {fields.map((field, index) => {
          const key = fieldKey(field, index);
          return (
            <Form.Item
              key={field.id}
              name={key}
              label={field.label}
              help={field.helperText}
              valuePropName={field.type === "checkbox" ? "checked" : field.type === "file" ? "fileList" : "value"}
              getValueFromEvent={field.type === "file" ? normalizeUpload : undefined}
              rules={submissionRules(field)}
            >
              <SubmissionControl field={field} />
            </Form.Item>
          );
        })}
      </Form>
      <div className="connection-step-actions"><Button onClick={onBack}><ArrowRight size={14} /> بازگشت</Button><Button type="primary" icon={<Send size={14} />} loading={mutation.isPending} onClick={submit}>ارسال پاسخ</Button></div>
    </div>
  );
}

export default function FormConnectionFlow({ open, onClose, title, description, fields, onStatusChange }) {
  const { message: notify } = AntApp.useApp();
  const [flow, setFlow] = useState(loadFlow);
  const [step, setStep] = useState(flow.definition ? 2 : flow.category ? 1 : 0);
  const createCategory = useCreateFormCategory();
  const createDefinition = useCreateFormDefinition();
  const createField = useCreateFormField();
  const createSubmission = useCreateFormSubmission();

  const update = (recipe) => {
    setFlow((current) => {
      const next = persistFlow(recipe(current));
      onStatusChange?.(next);
      return next;
    });
  };

  const steps = useMemo(() => [
    { title: "دسته‌بندی", icon: <FolderPlus size={14} /> },
    { title: "تعریف فرم", icon: <FilePlus2 size={14} /> },
    { title: "فیلدها", icon: <FormInput size={14} /> },
    { title: "ارسال", icon: <Send size={14} /> },
  ], []);

  const selectCategory = (category, exists) => {
    update((current) => ({
      ...current,
      categories: exists ? current.categories : [...current.categories.filter((item) => item.id !== category.id), category],
      category,
      definition: current.category?.id === category.id ? current.definition : null,
      syncedFields: current.category?.id === category.id ? current.syncedFields : [],
    }));
    setStep(1);
  };

  const setDefinition = (definition) => {
    update((current) => ({ ...current, definition, syncedFields: [] }));
    setStep(2);
  };

  const setSynced = (syncedFields, advance = true) => {
    update((current) => ({ ...current, syncedFields }));
    if (advance) setStep(3);
  };

  const resetFlow = () => {
    const next = persistFlow(emptyFlow);
    setFlow(next);
    setStep(0);
    onStatusChange?.(next);
  };

  return (
    <Drawer
      className="form-connection-drawer"
      width={760}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      title={<span className="connection-drawer-title"><Link2 size={17} /> اتصال فرم به API</span>}
      extra={<Button type="text" danger onClick={resetFlow}>شروع مجدد</Button>}
    >
      <div className="connection-api-badge"><Database size={13} /><span dir="ltr">POST /api/v1/forms/…</span><Tag color="green">Frontend only</Tag></div>
      <Steps className="connection-steps" current={step} items={steps} responsive={false} />
      <div className="connection-step-card">
        {step === 0 && <CategoryStep flow={flow} mutation={createCategory} notify={notify} onCreated={selectCategory} />}
        {step === 1 && <DefinitionStep flow={flow} title={title} description={description} mutation={createDefinition} notify={notify} onCreated={setDefinition} onBack={() => setStep(0)} />}
        {step === 2 && <FieldsStep flow={flow} fields={fields} mutation={createField} notify={notify} onSynced={setSynced} onBack={() => setStep(1)} />}
        {step === 3 && <SubmissionStep flow={flow} fields={fields} mutation={createSubmission} notify={notify} onBack={() => setStep(2)} onDone={onClose} />}
      </div>
      <div className="connection-contract-note"><CheckCircle2 size={13} />تمام payloadها پیش از ارسال به قرارداد فعلی API تبدیل می‌شوند؛ هیچ تغییری در backend لازم نیست.</div>
    </Drawer>
  );
}
