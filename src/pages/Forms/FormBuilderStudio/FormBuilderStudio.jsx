/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
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
  Hash,
  Maximize2,
  Move,
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
  GRID,
  canvasHeight,
  canvasWidth,
  clamp,
  colsToPx,
  normalizeFields,
  pxToCols,
  pxToRows,
  pxToX,
  rowsToPx,
  settleCollisions,
  stripLayout,
  writeLayout,
  xToPx,
} from "./formStudioLayout";
import "./form-builder-studio.css";

const FIELD_TYPES = [
  ["text", "متن کوتاه", Type, "violet"],
  ["textarea", "متن بلند", Type, "indigo"],
  ["number", "عدد", Hash, "teal"],
  ["select", "لیست کشویی", ChevronDown, "amber"],
  ["radio", "گزینه رادیویی", CheckSquare, "rose"],
  ["checkbox", "چک‌باکس", CheckSquare, "rose"],
  ["date", "تاریخ", CalendarDays, "sky"],
  ["file", "بارگذاری فایل", FileUp, "slate"],
  ["rating", "امتیازدهی", Star, "gold"],
];

const TYPE_META = new Map(FIELD_TYPES.map(([type, , , tone]) => [type, tone]));

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
  css_class: writeLayout(field.css_class, {
    x: field.x,
    y: field.y,
    w: field.w,
    h: field.h,
  }),
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

/**
 * A single field card on the free canvas. It knows nothing about grid
 * snapping — it just reports raw pointer deltas up to the canvas via
 * onDragStart/onResizeStart, which owns the live px position while a
 * gesture is in progress (see Studio's `gesture` state).
 */
function FieldCard({
  field,
  left,
  top,
  width,
  height,
  isActive,
  isSelected,
  onEdit,
  onRemove,
  onSelect,
  onDragStart,
  onResizeStart,
  onNudge,
}) {
  const tone = TYPE_META.get(field.field_type) || "violet";
  return (
    <div
      className={`studio-field-card tone-${tone}${isActive ? " is-dragging" : ""}${
        isSelected ? " is-selected" : ""
      }`}
      style={{ left, top, width, height }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(field.id);
      }}
    >
      <div className="studio-field-bar" />
      <div className="studio-field-head">
        <button
          type="button"
          className="studio-field-handle"
          aria-label="جابه‌جایی فیلد"
          onPointerDown={(event) => onDragStart(event, field)}
          onKeyDown={(event) => onNudge(event, field)}
        >
          <Move size={14} />
        </button>
        <button
          type="button"
          className="studio-field-title"
          onClick={() => onEdit(field)}
        >
          {field.field_label || "بدون عنوان"}
          {field.required && <b>*</b>}
        </button>
        <div
          className="studio-field-actions"
          onPointerDown={(event) => event.stopPropagation()}
        >
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
      </div>
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
        className="studio-field-resize"
        aria-label="تغییر اندازه فیلد"
        onPointerDown={(event) => onResizeStart(event, field)}
      >
        <Maximize2 size={11} />
      </button>
    </div>
  );
}

function Canvas({ fields, saving, onEdit, onRemove, onPersist }) {
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState(null); // { kind, id, ... }
  const [selectedId, setSelectedId] = useState(null);

  const width = canvasWidth();
  const height = canvasHeight(fields);

  const beginDrag = (event, field) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(field.id);
    setGesture({
      kind: "move",
      id: field.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originLeft: xToPx(field.x),
      originTop: rowsToPx(field.y),
      w: field.w,
      h: field.h,
      liveLeft: xToPx(field.x),
      liveTop: rowsToPx(field.y),
    });
  };

  const beginResize = (event, field) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(field.id);
    setGesture({
      kind: "resize",
      id: field.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originW: colsToPx(field.w),
      originH: rowsToPx(field.h),
      liveW: colsToPx(field.w),
      liveH: rowsToPx(field.h),
    });
  };

  useEffect(() => {
    if (!gesture) return undefined;

    const handleMove = (event) => {
      const dx = event.clientX - gesture.pointerX;
      const dy = event.clientY - gesture.pointerY;
      if (gesture.kind === "move") {
        const maxLeft = width - colsToPx(gesture.w);
        setGesture((prev) => ({
          ...prev,
          liveLeft: clamp(prev.originLeft + dx, 0, Math.max(maxLeft, 0)),
          liveTop: Math.max(prev.originTop + dy, 0),
        }));
      } else {
        setGesture((prev) => ({
          ...prev,
          liveW: clamp(
            prev.originW + dx,
            colsToPx(GRID.minCols),
            width - xToPx(fields.find((f) => f.id === prev.id)?.x || 0),
          ),
          liveH: Math.max(prev.originH + dy, rowsToPx(GRID.minRows)),
        }));
      }
    };

    const handleUp = () => {
      setGesture((current) => {
        if (!current) return null;
        const target = fields.find((f) => f.id === current.id);
        if (!target) return null;

        let next;
        if (current.kind === "move") {
          const w = current.w;
          const x = clamp(pxToX(current.liveLeft), 0, GRID.cols - w);
          const y = Math.max(pxToRows(current.liveTop), 0);
          next = fields.map((f) => (f.id === target.id ? { ...f, x, y } : f));
        } else {
          const w = clamp(pxToCols(current.liveW), GRID.minCols, GRID.cols - target.x);
          const h = Math.max(pxToRows(current.liveH), GRID.minRows);
          next = fields.map((f) => (f.id === target.id ? { ...f, w, h } : f));
        }
        onPersist(settleCollisions(next, target.id));
        return null;
      });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesture?.id, gesture?.kind]);

  const nudge = (event, field) => {
    const step = event.shiftKey ? 2 : 1;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = step;
    else if (event.key === "ArrowRight") dx = -step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else return;
    event.preventDefault();
    const x = clamp(field.x + dx, 0, GRID.cols - field.w);
    const y = Math.max(field.y + dy, 0);
    const next = fields.map((f) => (f.id === field.id ? { ...f, x, y } : f));
    onPersist(settleCollisions(next, field.id));
  };

  return (
    <div
      className="studio-canvas-scroll"
      onPointerDown={() => setSelectedId(null)}
    >
      <div
        className="studio-canvas-surface"
        ref={canvasRef}
        style={{ width, height, opacity: saving ? 0.75 : 1 }}
      >
        {fields.map((field) => {
          const isActive = gesture?.id === field.id;
          const left = isActive && gesture.kind === "move" ? gesture.liveLeft : xToPx(field.x);
          const top = isActive && gesture.kind === "move" ? gesture.liveTop : rowsToPx(field.y);
          const w = isActive && gesture.kind === "resize" ? gesture.liveW : colsToPx(field.w);
          const h = isActive && gesture.kind === "resize" ? gesture.liveH : rowsToPx(field.h);
          return (
            <FieldCard
              key={field.id}
              field={field}
              left={left}
              top={top}
              width={w}
              height={h}
              isActive={isActive}
              isSelected={selectedId === field.id}
              onEdit={onEdit}
              onRemove={onRemove}
              onSelect={setSelectedId}
              onDragStart={beginDrag}
              onResizeStart={beginResize}
              onNudge={nudge}
            />
          );
        })}
      </div>
    </div>
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
      refresh();
    } catch (error) {
      message.error(getApiErrorMessage(error, "ذخیره چیدمان با مشکل مواجه شد"));
      refresh();
    }
  };

  const add = async (type) => {
    const order = fields.length;
    const takenRows = fields.map((f) => f.y + f.h);
    const y = takenRows.length ? Math.max(...takenRows) + GRID.gapAfterPlace : 0;
    const draft = {
      field_type: type,
      field_label:
        FIELD_TYPES.find(([value]) => value === type)?.[1] || "فیلد جدید",
      field_name: `field-${Date.now().toString(36)}`,
      required: false,
      choices: [],
      x: 0,
      y,
      w: GRID.defaultCols,
      h: GRID.defaultRows,
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
          {FIELD_TYPES.map(([type, label, Icon, tone]) => (
            <Button
              key={type}
              className={`studio-library-btn tone-${tone}`}
              onClick={() => add(type)}
              disabled={saving}
            >
              <span className="studio-library-icon">
                <Icon size={15} />
              </span>
              {label}
              <Plus size={13} className="studio-library-plus" />
            </Button>
          ))}
        </aside>
        <main className="studio-canvas">
          <div className="studio-canvas-heading">
            <div>
              <h2>چیدمان فیلدها</h2>
              <p>
                فیلد را از دسته‌ی وسط بکشید تا هرجای بوم که می‌خواهید رها
                شود، و از گوشه‌ی پایین‌راست اندازه‌اش را تغییر دهید.
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
            <Canvas
              fields={fields}
              saving={saving}
              onEdit={openEditor}
              onRemove={remove}
              onPersist={persistLayout}
            />
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
