/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  Switch,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  FileUp,
  GripVertical,
  Hash,
  Plus,
  Save,
  Star,
  Trash2,
  Type,
} from "lucide-react";
import {
  formDefinitionKey,
  useCreateFormField,
  useDeleteFormField,
  useFormDefinition,
  useUpdateFormField,
} from "../../../QueryServises/formsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../Services/forms/formUtils";
import { slugify } from "../../../Services/forms/formPayloads";
import {
  normalizeFields,
  reorderFields,
  stripLayout,
  WIDTHS,
  widthSpan,
  writeLayout,
} from "./formStudioLayout";
import "./form-builder-studio.css";

const FIELD_TYPES = [
  ["text", "متن کوتاه", Type],
  ["textarea", "متن بلند", Type],
  ["number", "عدد", Hash],
  ["select", "لیست کشویی", ChevronDown],
  ["radio", "گزینه رادیویی", CheckSquare],
  ["checkbox", "چک‌باکس", CheckSquare],
  ["date", "تاریخ", CalendarDays],
  ["file", "بارگذاری فایل", FileUp],
  ["rating", "امتیازدهی", Star],
];

const CHOICE_TYPES = new Set([
  "select",
  "radio",
  "checkboxes",
  "multiselect",
  "multiselect_list",
]);
const NUMBER_TYPES = new Set([
  "number",
  "decimal",
  "currency",
  "slider",
  "rating",
]);
const FILE_TYPES = new Set(["file", "multifile", "spreadsheet"]);

const fieldPayload = (field, formDefinitionId, order = field.order) => ({
  form_definition_id: Number(formDefinitionId),
  field_name: slugify(
    field.field_name || field.field_label || `field-${order + 1}`,
    "field",
  ),
  field_label: String(field.field_label || "").trim() || "فیلد بدون عنوان",
  field_type: field.field_type || "text",
  order,
  help_text: field.help_text || "",
  placeholder: field.placeholder || "",
  default_value: field.default_value == null ? "" : String(field.default_value),
  css_class: writeLayout(field.css_class, field.rowId, field.width),
  required: Boolean(field.required),
  min_value: field.min_value ?? null,
  max_value: field.max_value ?? null,
  min_length: field.min_length ?? null,
  max_length: field.max_length ?? null,
  regex_validation: field.regex_validation || "",
  regex_error_message: field.regex_error_message || "",
  choices: Array.isArray(field.choices) ? field.choices : [],
  allowed_extensions: field.allowed_extensions || "",
  max_file_size_mb: field.max_file_size_mb ?? null,
});

const editorValues = (field) => ({
  ...field,
  css_class: stripLayout(field.css_class),
  choicesText: (field.choices || [])
    .map((item) => (typeof item === "string" ? item : item.label || item.value))
    .join("\n"),
});

function FieldPreview({ field }) {
  const options = (field.choices || []).map((item) => {
    const value = typeof item === "string" ? item : item.value;
    return {
      value,
      label: typeof item === "string" ? item : item.label || value,
    };
  });
  if (field.field_type === "textarea")
    return <Input.TextArea rows={2} placeholder={field.placeholder} disabled />;
  if (field.field_type === "select")
    return (
      <Select
        className="w-full"
        options={options}
        placeholder={field.placeholder || "انتخاب کنید"}
        disabled
      />
    );
  if (field.field_type === "checkbox")
    return (
      <Checkbox disabled>{field.default_value || "تأیید می‌کنم"}</Checkbox>
    );
  if (NUMBER_TYPES.has(field.field_type))
    return (
      <InputNumber
        className="w-full"
        placeholder={field.placeholder}
        disabled
      />
    );
  if (FILE_TYPES.has(field.field_type))
    return (
      <Button block icon={<FileUp size={14} />} disabled>
        انتخاب فایل
      </Button>
    );
  return (
    <Input
      type={field.field_type === "date" ? "date" : "text"}
      placeholder={field.placeholder}
      disabled
    />
  );
}

function FieldCard({ field, onEdit, onRemove, onWidth, onDropField }) {
  return (
    <Card
      size="small"
      className="studio-field-card"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "application/x-form-field-id",
          String(field.id),
        );
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropField(
          event.dataTransfer.getData("application/x-form-field-id"),
          field.id,
          false,
        );
      }}
      title={
        <button
          type="button"
          className="studio-field-title"
          onClick={() => onEdit(field)}
        >
          <GripVertical size={16} />
          {field.field_label || "بدون عنوان"}
          {field.required && <b>*</b>}
        </button>
      }
      extra={
        <div
          className="studio-field-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <Select
            size="small"
            aria-label="عرض فیلد"
            value={field.width}
            options={WIDTHS}
            onChange={(width) => onWidth(field.id, width)}
          />
          <Tooltip title="حذف فیلد">
            <Button
              danger
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              onClick={() => onRemove(field)}
            />
          </Tooltip>
        </div>
      }
    >
      <button
        type="button"
        className="studio-field-body"
        onClick={() => onEdit(field)}
      >
        {field.help_text && <small>{field.help_text}</small>}
        <FieldPreview field={field} />
      </button>
      <button
        type="button"
        className="studio-side-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDropField(
            event.dataTransfer.getData("application/x-form-field-id"),
            field.id,
            true,
          );
        }}
      >
        کنار این فیلد رها کنید
      </button>
    </Card>
  );
}

function Studio({ formDefinitionId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const { data, isLoading, isError } = useFormDefinition(formDefinitionId);
  const createField = useCreateFormField();
  const updateField = useUpdateFormField();
  const deleteField = useDeleteFormField();
  const [fields, setFields] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const editedType = Form.useWatch("field_type", form);
  const definition = Array.isArray(data) ? data[0] : data;

  useEffect(() => setFields(normalizeFields(definition?.fields)), [definition]);
  const rows = useMemo(
    () =>
      fields.reduce((all, field) => {
        (all[field.rowId] ||= []).push(field);
        return all;
      }, {}),
    [fields],
  );
  const saving =
    createField.isPending || updateField.isPending || deleteField.isPending;

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: formDefinitionKey(formDefinitionId),
    });
  const persistLayout = async (next) => {
    setFields(next);
    try {
      await Promise.all(
        next.map((field, order) => {
          const payload = fieldPayload(field, formDefinitionId, order);
          delete payload.form_definition_id;
          return updateField.mutateAsync({
            id: field.id,
            payload,
            formDefinitionId,
          });
        }),
      );
      message.success("چیدمان با موفقیت ذخیره شد");
      refresh();
    } catch (error) {
      message.error(getApiErrorMessage(error, "ذخیره چیدمان با مشکل مواجه شد"));
      refresh();
    }
  };

  const add = async (type) => {
    const order = fields.length;
    const draft = {
      field_type: type,
      field_label:
        FIELD_TYPES.find(([value]) => value === type)?.[1] || "فیلد جدید",
      field_name: `field-${Date.now().toString(36)}`,
      required: false,
      choices: [],
      rowId: `row-${Date.now()}`,
      width: "1/1",
      order,
    };
    try {
      await createField.mutateAsync(
        fieldPayload(draft, formDefinitionId, order),
      );
      message.success("فیلد با موفقیت اضافه شد");
      refresh();
    } catch (error) {
      message.error(getApiErrorMessage(error, "افزودن فیلد با مشکل مواجه شد"));
    }
  };

  const openEditor = (field) => {
    setEditing(field);
    form.setFieldsValue(editorValues(field));
  };
  const closeEditor = () => {
    form.resetFields();
    setEditing(null);
  };
  const saveEditor = async () => {
    try {
      const values = await form.validateFields();
      const choices = String(values.choicesText || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const next = { ...editing, ...values, choices };
      const payload = fieldPayload(next, formDefinitionId);
      delete payload.form_definition_id;
      setFields((all) =>
        all.map((field) => (field.id === editing.id ? next : field)),
      );
      await updateField.mutateAsync({
        id: editing.id,
        payload,
        formDefinitionId,
      });
      message.success("فیلد با موفقیت ذخیره شد");
      closeEditor();
      refresh();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiErrorMessage(error, "ذخیره فیلد با مشکل مواجه شد"));
        refresh();
      }
    }
  };
  const remove = (field) =>
    modal.confirm({
      title: "حذف فیلد",
      content: `فیلد «${field.field_label}» حذف شود؟`,
      okText: "حذف",
      cancelText: "انصراف",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteField.mutateAsync({ id: field.id, formDefinitionId });
          setFields((all) => all.filter((item) => item.id !== field.id));
          message.success("فیلد با موفقیت حذف شد");
        } catch (error) {
          message.error(getApiErrorMessage(error, "حذف فیلد با مشکل مواجه شد"));
        }
      },
    });

  if (isLoading)
    return (
      <div className="studio-loading">
        <Spin size="large" tip="در حال بارگذاری فرم..." />
      </div>
    );
  if (isError || !definition)
    return (
      <div className="studio-loading">
        <Empty description="بارگذاری فرم با مشکل مواجه شد">
          <Button onClick={() => navigate("/forms")}>بازگشت</Button>
        </Empty>
      </div>
    );

  return (
    <div className="form-studio" dir="rtl">
      <header className="studio-header">
        <div>
          <Button
            type="text"
            icon={<ArrowRight size={17} />}
            onClick={() => navigate("/forms")}
          >
            بازگشت
          </Button>
          <span />
          <div>
            <h1>{definition.name}</h1>
            <p>
              استودیو ساخت فرم · {fields.length.toLocaleString("fa-IR")} فیلد
            </p>
          </div>
        </div>
        <Tag color={saving ? "processing" : "success"}>
          {saving ? "در حال ذخیره" : "ذخیره‌شده"}
        </Tag>
      </header>
      <div className="studio-workspace">
        <aside className="studio-library">
          <h2>فیلدهای فرم</h2>
          <p>برای افزودن یک نوع فیلد کلیک کنید.</p>
          {FIELD_TYPES.map(([type, label, Icon]) => (
            <Button
              key={type}
              icon={<Icon size={15} />}
              onClick={() => add(type)}
              disabled={saving}
            >
              {label}
              <Plus size={13} />
            </Button>
          ))}
        </aside>
        <main className="studio-canvas">
          <div className="studio-canvas-heading">
            <div>
              <h2>چیدمان فیلدها</h2>
              <p>
                برای ترتیب، کارت را بکشید؛ برای هم‌ردیف شدن روی ناحیه «کنار این
                فیلد» رها کنید.
              </p>
            </div>
          </div>
          {!fields.length ? (
            <Empty description="هنوز فیلدی اضافه نشده">
              <Button
                type="primary"
                icon={<Plus size={15} />}
                onClick={() => add("text")}
              >
                افزودن اولین فیلد
              </Button>
            </Empty>
          ) : (
            Object.entries(rows).map(([rowId, rowFields]) => (
              <Row className="studio-row" gutter={[16, 16]} key={rowId}>
                {rowFields.map((field) => (
                  <Col xs={24} md={widthSpan(field.width)} key={field.id}>
                    <FieldCard
                      field={field}
                      onEdit={openEditor}
                      onRemove={remove}
                      onWidth={(id, width) =>
                        persistLayout(
                          fields.map((item) =>
                            item.id === id ? { ...item, width } : item,
                          ),
                        )
                      }
                      onDropField={(from, to, beside) =>
                        from &&
                        persistLayout(reorderFields(fields, from, to, beside))
                      }
                    />
                  </Col>
                ))}
              </Row>
            ))
          )}
        </main>
      </div>
      <Drawer
        title="ویرایش ویژگی‌های فیلد"
        placement="right"
        width={520}
        open={Boolean(editing)}
        onClose={closeEditor}
        destroyOnClose
        extra={
          <Button
            type="primary"
            icon={<Save size={15} />}
            loading={updateField.isPending}
            onClick={saveEditor}
          >
            اعمال و ذخیره
          </Button>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional" dir="rtl">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="field_label"
                label="عنوان فیلد"
                rules={[{ required: true, message: "عنوان فیلد را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="field_name"
                label="نام فنی"
                rules={[
                  { required: true },
                  {
                    pattern: /^[-a-zA-Z0-9_]+$/,
                    message: "فقط حروف انگلیسی، عدد، خط تیره و زیرخط",
                  },
                ]}
              >
                <Input dir="ltr" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="field_type" label="نوع فیلد">
            <Select
              options={FIELD_TYPES.map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
          <Form.Item name="placeholder" label="متن جایگزین">
            <Input />
          </Form.Item>
          <Form.Item name="help_text" label="متن راهنما">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="default_value" label="مقدار پیش‌فرض">
            <Input />
          </Form.Item>
          {editing && CHOICE_TYPES.has(editedType || editing.field_type) && (
            <Form.Item
              name="choicesText"
              label="گزینه‌ها"
              extra="هر گزینه را در یک خط وارد کنید"
            >
              <Input.TextArea rows={5} />
            </Form.Item>
          )}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="min_length" label="حداقل طول">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_length" label="حداکثر طول">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="min_value" label="حداقل مقدار">
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_value" label="حداکثر مقدار">
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="regex_validation" label="قانون Regex">
            <Input dir="ltr" />
          </Form.Item>
          <Form.Item name="regex_error_message" label="پیام خطای اعتبارسنجی">
            <Input />
          </Form.Item>
          <Form.Item name="allowed_extensions" label="پسوندهای مجاز فایل">
            <Input dir="ltr" placeholder="pdf,docx,png" />
          </Form.Item>
          <Form.Item name="max_file_size_mb" label="حداکثر حجم فایل (MB)">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="css_class" label="کلاس CSS">
            <Input dir="ltr" />
          </Form.Item>
          <Form.Item
            name="required"
            label="پاسخ اجباری"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default function FormBuilderStudio() {
  const { formDefinitionId } = useParams();
  if (!/^\d+$/.test(formDefinitionId || ""))
    return <Empty description="شناسه فرم نامعتبر است" />;
  return (
    <ConfigProvider direction="rtl">
      <App>
        <Studio formDefinitionId={formDefinitionId} />
      </App>
    </ConfigProvider>
  );
}
