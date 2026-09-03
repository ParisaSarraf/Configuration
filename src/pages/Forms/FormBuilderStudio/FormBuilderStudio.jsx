/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  ConfigProvider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Segmented,
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
  Table as TableIcon,
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
import "../FormRuntime/form-runtime.css";
import "../FormRuntime/field-extras.css";
import { EyeOutlined } from "@ant-design/icons";
import FieldControl from "../FormRuntime/FieldControl";
import SheetTable from "../FormRuntime/SheetTable";
import SheetBuilder from "../FormRuntime/SheetBuilder";
import HeaderBuilder, { LogoPicker } from "../FormRuntime/HeaderBuilder";
import { emptySheet } from "../FormRuntime/formElements";
import {
  AUTO_PATTERNS,
  FIELD_DEFS,
  GROUPS,
  MATRIX_COLUMN_TYPES,
  applyTypeMarker,
  canonicalType,
  defaultChoicesFor,
  hasPanel,
  labelOf,
  payloadKeysOf,
  resolveType,
  toBackendType,
  toChoiceObjects,
  toMatrixColumns,
} from "../FormRuntime/fieldSchema";
import MatrixInput from "../FormRuntime/MatrixInput";
import { CHANGE_REQUEST_TEMPLATE } from "../FormRuntime/sampleChangeRequestForm";
import FormLiveEditor from "../FormRuntime/FormLiveEditor";
import { flowLayout, moveFieldTo } from "../FormRuntime/flowLayout";

const HIDE = { display: "none" };

const TYPE_ICONS = {
  number: Hash,
  decimal: Hash,
  currency: Hash,
  slider: Hash,
  rating: Star,
  date: CalendarDays,
  datetime: CalendarDays,
  time: CalendarDays,
  select: ChevronDown,
  multiselect_list: ChevronDown,
  radio: CheckSquare,
  option_row: CheckSquare,
  checkbox: CheckSquare,
  checkboxes: CheckSquare,
  multiselect: CheckSquare,
  file: FileUp,
  multifile: FileUp,
  matrix: TableIcon,
  sheet_table: TableIcon,
  date_signature: CalendarDays,
  form_number: Hash,
  logo: FileUp,
};

const GROUP_TONES = {
  "ورودی متن": "violet",
  "عدد و زمان": "teal",
  "انتخاب": "amber",
  "فایل": "slate",
  "جدول": "cyan",
  "سند": "sky",
};

// پالت از رجیستری واحد ساخته می‌شود: [type, label, Icon, tone, group]
const FIELD_TYPES = FIELD_DEFS.map((def) => [
  def.type,
  def.label,
  TYPE_ICONS[def.type] || Type,
  GROUP_TONES[def.group] || "violet",
  def.group,
]);

const LAYOUT_ONLY = new Set([
  "section",
  "doc_header",
  "display_text",
  "divider",
  "page_break",
  "logo",
  "form_number",
]);

const TYPE_META = new Map(FIELD_TYPES.map(([type, , , tone]) => [type, tone]));

// انواعی که فهرست گزینه دارند (جدول‌ها جدا هستند)
const CHOICE_TYPES = new Set(
  FIELD_DEFS.filter((def) => hasPanel(def.type, "choices")).map(
    (def) => def.type,
  ),
);
const STRUCTURED_TYPES = new Set(["sheet_table", "doc_header"]);

const defaultChoices = (type) =>
  canonicalType(type) === "sheet_table"
    ? emptySheet(3, 3)
    : defaultChoicesFor(type);

const defaultHeight = (type) => {
  const kind = canonicalType(type);
  if (kind === "section" || kind === "divider" || kind === "display_text")
    return 3;
  if (kind === "page_break") return 2;
  if (kind === "form_number") return 3;
  if (kind === "logo") return 7;
  if (kind === "date_signature") return 5;
  if (kind === "doc_header") return 8;
  if (
    kind === "sheet_table" ||
    kind === "matrix" ||
    kind === "textarea" ||
    kind === "address"
  )
    return GRID.defaultRows * 2;
  if (kind === "option_row" || kind === "signature" || kind === "slider")
    return 4;
  return GRID.defaultRows;
};

const LAYOUT_SAVE_DELAY = 1500;

// مقدار «خالی» هر کلید اختیاری. اگر کلیدی به نوع فیلد مربوط نباشد،
// صریحاً خالی فرستاده می‌شود تا مقدار قدیمی روی رکورد باقی نماند.
const EMPTY_BY_KEY = {
  placeholder: "",
  help_text: "",
  default_value: "",
  min_length: null,
  max_length: null,
  min_value: null,
  max_value: null,
  regex_validation: "",
  regex_error_message: "",
  choices: [],
  allowed_extensions: "",
  max_file_size_mb: null,
};

// فقط کلیدهای مرتبط با نوع فیلد به API فرستاده می‌شوند.
const fieldPayload = (field, formDefinitionId, order = field.order) => {
  const type = resolveType(field);
  const def = FIELD_DEFS.find((item) => item.type === type);
  const allowed = payloadKeysOf(type);

  const optional = {
    placeholder: field.placeholder || "",
    help_text: field.help_text || "",
    default_value:
      field.default_value == null ? "" : String(field.default_value),
    min_length: field.min_length ?? null,
    max_length: field.max_length ?? null,
    min_value: field.min_value ?? null,
    max_value: field.max_value ?? null,
    regex_validation: field.regex_validation || "",
    regex_error_message: field.regex_error_message || "",
    choices: Array.isArray(field.choices) ? field.choices : [],
    allowed_extensions: field.allowed_extensions || "",
    max_file_size_mb: field.max_file_size_mb ?? null,
  };

  // اعتبارسنجی خودکار ایمیل / URL / تلفن
  const auto = def && def.autoPattern ? AUTO_PATTERNS[def.autoPattern] : null;
  if (auto && !optional.regex_validation) {
    optional.regex_validation = auto.regex;
    optional.regex_error_message = optional.regex_error_message || auto.message;
  }

  const payload = {
    form_definition_id: Number(formDefinitionId),
    field_name: slugify(
      field.field_name || field.field_label || `field-${order + 1}`,
      "field",
    ),
    field_label:
      String(field.field_label || "").trim() || "فیلد بدون عنوان",
    field_type: toBackendType(type),
    order,
    css_class: writeLayout(applyTypeMarker(type, field.css_class), {
      x: field.x,
      y: field.y,
      w: field.w,
      h: field.h,
    }),
    required: Boolean(field.required),
  };

  Object.keys(EMPTY_BY_KEY).forEach((key) => {
    payload[key] = allowed.has(key) ? optional[key] : EMPTY_BY_KEY[key];
  });

  return payload;
};

const editorValues = (field) => {
  const type = resolveType(field);
  return {
    ...field,
    field_type: type,
    css_class: stripLayout(field.css_class),
    choiceList: CHOICE_TYPES.has(type) ? toChoiceObjects(field.choices) : [],
    columns:
      type === "matrix"
        ? toMatrixColumns(field.choices).map((col) => ({
            ...col,
            optionsText: (col.options || [])
              .map((option) => option.label)
              .join(", "),
          }))
        : [],
    structureText: STRUCTURED_TYPES.has(type)
      ? JSON.stringify(field.choices || [], null, 2)
      : "",
  };
};

// پیش‌نمایش عناصر سندی با همان CSS خروجی چاپ (fr-*)
function DocElementPreview({ field }) {
  const type = resolveType(field);
  if (type === "page_break")
    return <div className="fr-pagebreak">شکست صفحه در چاپ</div>;
  if (type === "divider") return <div className="fr-divider" />;
  if (type === "section")
    return <div className="fr-band">{field.field_label}</div>;
  if (type === "display_text")
    return (
      <div className="fr-cell fr-plain">
        <span className="fr-static">
          {field.default_value || field.field_label}
        </span>
      </div>
    );
  if (type === "doc_header") {
    const meta = Array.isArray(field.choices) ? field.choices : [];
    return (
      <div className="fr-docheader">
        <div className="fr-docheader-meta">
          {meta.map((item, index) => (
            <span key={item.key || index}>
              {item.label}: <b>{item.value}</b>
            </span>
          ))}
        </div>
        <div className="fr-docheader-title">{field.field_label}</div>
        <div className="fr-docheader-logo">
          {field.default_value ? (
            <img src={field.default_value} alt="لوگو" />
          ) : (
            <span className="fr-help">لوگو</span>
          )}
        </div>
      </div>
    );
  }
  if (type === "logo")
    return (
      <div className="fr-logo">
        {field.default_value ? (
          <img src={field.default_value} alt={field.field_label || "لوگو"} />
        ) : (
          <span className="fr-logo-empty">{field.field_label || "لوگو"}</span>
        )}
      </div>
    );
  if (type === "form_number")
    return (
      <div className="fr-cell fr-plain">
        <span className="fr-formnumber">
          <span className="fr-formnumber-label">
            {field.field_label || "شماره فرم"}:
          </span>
          <span className="fr-formnumber-value">
            {field.default_value || "—"}
          </span>
        </span>
      </div>
    );
  if (type === "sheet_table")
    return <SheetTable field={field} values={{}} readOnly />;
  return (
    <div className="fr-cell">
      {field.field_label && (
        <span className="fr-label">{field.field_label}</span>
      )}
      <FieldControl field={field} value={undefined} readOnly />
    </div>
  );
}

function FieldPreview({ field }) {
  const type = resolveType(field);

  if (
    LAYOUT_ONLY.has(type) ||
    type === "sheet_table" ||
    type === "option_row" ||
    type === "signature"
  )
    return (
      <div className="fr-root" style={{ width: "100%" }}>
        <DocElementPreview field={field} />
      </div>
    );

  // جدول پرشدنی: همان کنترل واقعی، فقط غیرفعال
  if (type === "matrix")
    return (
      <div className="fr-root studio-matrix-preview" style={{ width: "100%" }}>
        <MatrixInput field={field} value={[]} readOnly />
      </div>
    );

  // بقیهٔ انواع با همان کنترلی که کاربر نهایی می‌بیند
  return (
    <div className="fr-root" style={{ width: "100%" }}>
      <FieldControl field={{ ...field, field_type: type }} readOnly />
    </div>
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
          const w = clamp(
            pxToCols(current.liveW),
            GRID.minCols,
            GRID.cols - target.x,
          );
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
          const left =
            isActive && gesture.kind === "move"
              ? gesture.liveLeft
              : xToPx(field.x);
          const top =
            isActive && gesture.kind === "move"
              ? gesture.liveTop
              : rowsToPx(field.y);
          const w =
            isActive && gesture.kind === "resize"
              ? gesture.liveW
              : colsToPx(field.w);
          const h =
            isActive && gesture.kind === "resize"
              ? gesture.liveH
              : rowsToPx(field.h);
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
  // نوع مورد ویرایش (با در نطر گرفتن نشانهٔ css) — مبنای نمایش پنل‌ها
  const activeType = resolveType({
    field_type: editedType || editing?.field_type,
    css_class: editing?.css_class,
  });
  const definition = Array.isArray(data) ? data[0] : data;
  const [designMode, setDesignMode] = useState("live");
  const pendingInsertIndex = useRef(null);
  const layoutSaveTimer = useRef(null);
  const pendingLayout = useRef(null);
  const savedLayout = useRef([]);
  const layoutSaveInProgress = useRef(false);

  // const handleShowPreview = () => {
  //   setModal({
  //     mode: "preview",
  //     data: formDefinitionId,
  //     type: "viewCategoryDefinitionDetail",
  //   });
  // };

  useEffect(() => {
    const initialFields = normalizeFields(definition?.fields);
    const insertAt = pendingInsertIndex.current;
    pendingInsertIndex.current = null;
    // فیلدی که در حالت طراحی روی فرم «بین دو ردیف» اضافه شده، اول در انتها
    // ساخته می‌شود و بعد به جایگاه درست منتقل و چیدمان ذخیره می‌شود.
    if (insertAt != null && initialFields.length > 1) {
      const last = initialFields[initialFields.length - 1];
      const moved = flowLayout(moveFieldTo(initialFields, last.id, insertAt));
      savedLayout.current = initialFields;
      setFields(moved);
      pendingLayout.current = moved;
      if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current);
      layoutSaveTimer.current = setTimeout(flushLayout, LAYOUT_SAVE_DELAY);
      return;
    }
    setFields(initialFields);
    savedLayout.current = initialFields;
  }, [definition]);

  useEffect(
    () => () => {
      if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current);
    },
    [],
  );

  const saving =
    createField.isPending || updateField.isPending || deleteField.isPending;

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: formDefinitionKey(formDefinitionId),
    });

  const hasLayoutChanged = (field, order) => {
    const previous = savedLayout.current.find((item) => item.id === field.id);
    return (
      !previous ||
      previous.x !== field.x ||
      previous.y !== field.y ||
      previous.w !== field.w ||
      previous.h !== field.h ||
      previous.order !== order
    );
  };

  const flushLayout = async () => {
    if (layoutSaveInProgress.current || !pendingLayout.current) return;
    const next = pendingLayout.current;
    pendingLayout.current = null;
    layoutSaveInProgress.current = true;
    try {
      const changedFields = next.filter(hasLayoutChanged);
      for (const field of changedFields) {
        const order = next.findIndex((item) => item.id === field.id);
        const payload = fieldPayload(field, formDefinitionId, order);
        delete payload.form_definition_id;
        await updateField.mutateAsync({
          id: field.id,
          payload,
          formDefinitionId,
          invalidate: false,
        });
      }
      savedLayout.current = next;
    } catch (error) {
      message.error(getApiErrorMessage(error, "ذخیره چیدمان با مشکل مواجه شد"));
      refresh();
    } finally {
      layoutSaveInProgress.current = false;
      if (pendingLayout.current) {
        layoutSaveTimer.current = setTimeout(flushLayout, LAYOUT_SAVE_DELAY);
      }
    }
  };

  const persistLayout = (next) => {
    setFields(next);
    pendingLayout.current = next;
    if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current);
    layoutSaveTimer.current = setTimeout(flushLayout, LAYOUT_SAVE_DELAY);
  };

  // چیدمان ساده (ردیفی): مختصات از ترتیب + عرض حساب می‌شود.
  const persistFlow = (next) => persistLayout(flowLayout(next));

  // افزودن فیلد در جایگاه مشخص (بین دو ردیف فرم)
  const addAt = async (type, index) => {
    pendingInsertIndex.current = Number.isInteger(index) ? index : null;
    await add(type);
  };

  // تغییر عنوان فیلد از روی خود فرم
  const relabel = async (field, label) => {
    const trimmed = String(label || "").trim();
    if (!trimmed || trimmed === field.field_label) return;
    const next = { ...field, field_label: trimmed };
    setFields((all) => all.map((item) => (item.id === field.id ? next : item)));
    try {
      const payload = fieldPayload(next, formDefinitionId, next.order);
      delete payload.form_definition_id;
      await updateField.mutateAsync({
        id: field.id,
        payload,
        formDefinitionId,
        invalidate: false,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error, "تغییر عنوان ذخیره نشد"));
      refresh();
    }
  };

  // تکثیر فیلد و قراردادن کپی بلافاصله بعد از فیلد اصلی
  const duplicate = async (field, index) => {
    pendingInsertIndex.current = Number.isInteger(index) ? index + 1 : null;
    const draft = {
      ...field,
      field_name: `${field.field_name || "field"}-${Date.now().toString(36)}`,
    };
    delete draft.id;
    try {
      await createField.mutateAsync(
        fieldPayload(draft, formDefinitionId, fields.length),
      );
      message.success("فیلد تکثیر شد");
      refresh();
    } catch (error) {
      message.error(getApiErrorMessage(error, "تکثیر فیلد با مشکل مواجه شد"));
    }
  };

  const add = async (type) => {
    const order = fields.length;
    const takenRows = fields.map((f) => f.y + f.h);
    const y = takenRows.length
      ? Math.max(...takenRows) + GRID.gapAfterPlace
      : 0;
    const draft = {
      field_type: type,
      field_label: labelOf(type),
      field_name: `field-${Date.now().toString(36)}`,
      required: false,
      choices: defaultChoices(type),
      default_value:
        canonicalType(type) === "display_text"
          ? "متن دلخواه سند"
          : "",
      min_value:
        canonicalType(type) === "sheet_table"
          ? 3
          : canonicalType(type) === "slider"
            ? 0
            : null,
      max_value:
        canonicalType(type) === "sheet_table"
          ? 3
          : canonicalType(type) === "slider"
            ? 100
            : canonicalType(type) === "rating"
              ? 5
              : null,
      x: 0,
      y,
      w: GRID.defaultCols,
      h: defaultHeight(type),
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

  // درج یک‌مرحله‌ای قالب رسمی «درخواست تغییرات»
  const insertTemplate = async () => {
    const takenRows = fields.map((f) => f.y + f.h);
    const baseY = takenRows.length
      ? Math.max(...takenRows) + GRID.gapAfterPlace
      : 0;
    const baseOrder = fields.length;
    const stamp = Date.now().toString(36);
    try {
      for (let index = 0; index < CHANGE_REQUEST_TEMPLATE.length; index += 1) {
        const draft = CHANGE_REQUEST_TEMPLATE[index];
        // eslint-disable-next-line no-await-in-loop
        await createField.mutateAsync(
          fieldPayload(
            {
              ...draft,
              field_name: `${draft.field_name}-${stamp}${index}`,
              y: baseY + draft.y,
            },
            formDefinitionId,
            baseOrder + index,
          ),
        );
      }
      message.success("قالب فرم رسمی درج شد");
    } catch (error) {
      message.error(getApiErrorMessage(error, "درج قالب با مشکل مواجه شد"));
    } finally {
      refresh();
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
      const editedFieldType = canonicalType(
        values.field_type || editing.field_type,
      );
      const isMatrix = editedFieldType === "matrix";
      const isStructured = STRUCTURED_TYPES.has(editedFieldType);
      let choices = [];
      if (isStructured) {
        let parsed = null;
        try {
          parsed = JSON.parse(values.structureText || "[]");
        } catch {
          parsed = null;
        }
        if (!Array.isArray(parsed)) {
          message.error("ساختار JSON معتبر نیست؛ تغییرات ذخیره نشد.");
          return;
        }
        choices = parsed;
      } else if (isMatrix) {
        // ستون‌های جدول پرشدنی: [{ value, label, type }]
        choices = (values.columns || [])
          .filter((col) => col && String(col.label || "").trim())
          .map((col, index) => ({
            value: String(
              col.value || col.key || slugify(col.label, `column-${index + 1}`),
            ),
            label: String(col.label).trim(),
            type: col.type || "text",
            ...(col.type === "select"
              ? {
                  options: toChoiceObjects(
                    String(col.optionsText || "")
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  ),
                }
              : {}),
          }));
        if (!choices.length) {
          message.error("برای جدول حداقل یک ستون تعریف کنید.");
          return;
        }
      } else if (CHOICE_TYPES.has(editedFieldType)) {
        // قالب مورد توافق بک‌اند: [{ value, label }]
        choices = (values.choiceList || [])
          .filter((item) => item && String(item.label || "").trim())
          .map((item, index) => ({
            value:
              String(item.value || "").trim() ||
              slugify(item.label, `option-${index + 1}`),
            label: String(item.label).trim(),
          }));
      }
      const next = {
        ...editing,
        ...values,
        field_type: editedFieldType,
        choices,
      };
      delete next.choiceList;
      delete next.columns;
      delete next.structureText;
      delete next.choicesText;
      const payload = fieldPayload(next, formDefinitionId);
      delete payload.form_definition_id;
      setFields((all) =>
        all.map((field) => (field.id === editing.id ? next : field)),
      );
      await updateField.mutateAsync({
        id: editing.id,
        payload,
        formDefinitionId,
        invalidate: false,
      });
      message.success("فیلد با موفقیت ذخیره شد");
      closeEditor();
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
        <>
          <Tag color={saving ? "processing" : "success"}>
            {saving ? "در حال ذخیره" : "ذخیره‌شده"}
          </Tag>
          {/* <Button
            className="text-sky-700 border-sky-700"
            icon={<EyeOutlined />}
            onClick={handleShowPreview}
          >
            پیش نمایش
          </Button> */}
          <Segmented
            size="small"
            value={designMode}
            onChange={setDesignMode}
            options={[
              { value: "live", label: "طراحی روی فرم" },
              { value: "grid", label: "چیدمان آزاد" },
            ]}
          />
          <Button onClick={insertTemplate} disabled={saving}>
            درج قالب فرم رسمی
          </Button>
        </>
      </header>
      <div className="studio-workspace">
        <aside className="studio-library">
          <h2>فیلدهای فرم</h2>
          <p>برای افزودن یک نوع فیلد کلیک کنید.</p>
          {GROUPS.map((group) => (
            <div key={group} className="studio-library-group">
              <h3>{group}</h3>
              {FIELD_TYPES.filter(([, , , , itemGroup]) => itemGroup === group).map(
                ([type, label, Icon, tone]) => (
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
                ),
              )}
            </div>
          ))}
        </aside>
        <main className="studio-canvas">
          {designMode === "live" ? (
            <FormLiveEditor
              fields={fields}
              types={FIELD_TYPES.map(([value, label]) => [value, label])}
              saving={saving}
              onAdd={addAt}
              onEdit={openEditor}
              onDelete={remove}
              onDuplicate={duplicate}
              onRelabel={relabel}
              onPersist={persistFlow}
            />
          ) : (
            <>
              <div className="studio-canvas-heading">
                <div>
                  <h2>چیدمان آزاد</h2>
                  <p>
                    در این حالت هر فیلد را می‌توانید هرجای بوم بکشید و از
                    گوشهٔ پایین‌راست اندازه‌اش را تغییر دهید.
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
            </>
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
          <div className="studio-editor-typebar">
            <span className="studio-editor-typename">
              نوع فیلد: <b>{labelOf(activeType)}</b>
            </span>
            <Form.Item name="field_type" noStyle>
              <Select
                size="small"
                className="studio-editor-typeswitch"
                popupMatchSelectWidth={false}
                options={FIELD_TYPES.map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
          </div>
          <p className="studio-editor-hint">
            فقط تنظیم‌هایی که برای این نوع فیلد معنا دارند نمایش داده می‌شوند.
          </p>

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
                extra="کلید ذخیره‌سازی در گزارش‌ها"
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

          <Form.Item
            name="required"
            label="پاسخ اجباری"
            valuePropName="checked"
            extra="بدون تکمیل این فیلد، ارسال فرم ممکن نیست."
            style={LAYOUT_ONLY.has(activeType) ? HIDE : undefined}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="help_text"
            label="متن راهنما"
            style={
              hasPanel(activeType, "basic") || hasPanel(activeType, "help")
                ? undefined
                : HIDE
            }
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="placeholder"
            label="متن جایگزین داخل کادر"
            style={hasPanel(activeType, "basic") ? undefined : HIDE}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="default_value"
            label={
              hasPanel(activeType, "checkboxLabel")
                ? "متن کنار تیک"
                : activeType === "logo"
                  ? "نشانی تصویر لوگو (URL)"
                  : activeType === "form_number"
                    ? "شماره یا کد فرم"
                    : hasPanel(activeType, "staticText")
                      ? "متن نمایشی"
                  : hasPanel(activeType, "docheader")
                    ? "نشانی تصویر لوگو"
                    : "مقدار پیش‌فرض"
            }
            style={
              hasPanel(activeType, "basic") ||
              hasPanel(activeType, "checkboxLabel") ||
              hasPanel(activeType, "staticText")
                ? undefined
                : HIDE
            }
          >
            {activeType === "logo" ? (
              <LogoPicker />
            ) : hasPanel(activeType, "staticText") &&
              activeType !== "form_number" ? (
              <Input.TextArea rows={3} />
            ) : (
              <Input />
            )}
          </Form.Item>

          <Form.Item
            label="گزینه‌ها"
            extra="برچسب را کاربر می‌بیند؛ مقدار (value) در پایگاه داده ذخیره می‌شود و اگر خالی بماند خودکار ساخته می‌شود."
            style={hasPanel(activeType, "choices") ? undefined : HIDE}
          >
            <Form.List name="choiceList">
              {(optionFields, { add: addOption, remove: removeOption }) => (
                <div className="studio-choice-list">
                  {optionFields.map((optionField) => (
                    <Row
                      key={optionField.key}
                      gutter={8}
                      align="middle"
                      className="studio-matrix-col-row"
                    >
                      <Col flex="auto">
                        <Form.Item name={[optionField.name, "label"]} noStyle>
                          <Input placeholder="برچسب (مانند: مرد)" />
                        </Form.Item>
                      </Col>
                      <Col flex="140px">
                        <Form.Item name={[optionField.name, "value"]} noStyle>
                          <Input dir="ltr" placeholder="value" />
                        </Form.Item>
                      </Col>
                      <Col flex="none">
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<Trash2 size={14} />}
                          onClick={() => removeOption(optionField.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<Plus size={14} />}
                    onClick={() => addOption({ label: "", value: "" })}
                  >
                    افزودن گزینه
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>

          {editing && activeType === "sheet_table" && (
            <Form.Item
              name="structureText"
              label="طراحی جدول"
              extra="روی هر خانه کلیک کنید تا نوع و متن آن مشخص شود؛ با + و × ردیف و ستون کم و زیاد می‌شود."
            >
              <SheetBuilder
                onSize={(rowCount, colCount) =>
                  form.setFieldsValue({
                    min_value: rowCount,
                    max_value: colCount,
                  })
                }
              />
            </Form.Item>
          )}

          {editing && activeType === "doc_header" && (
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => (
                <Form.Item
                  name="structureText"
                  label="سربرگ سند"
                  extra="عنوان، لوگو و ردیف‌ها را همین‌جا تغییر دهید؛ کادر بالا همان چیزی است که چاپ می‌شود."
                >
                  <HeaderBuilder
                    title={getFieldValue("field_label")}
                    onTitle={(text) =>
                      form.setFieldsValue({ field_label: text })
                    }
                    logo={getFieldValue("default_value")}
                    onLogo={(src) =>
                      form.setFieldsValue({ default_value: src })
                    }
                  />
                </Form.Item>
              )}
            </Form.Item>
          )}

          {editing && activeType === "matrix" && (
            <Form.Item
              label="ستون‌های جدول"
              required
              extra="ستون‌ها را شما می‌سازید؛ کاربر هنگام تکمیل فرم، ردیف‌ها را اضافه و پر می‌کند."
            >
              <Form.List name="columns">
                {(columnFields, { add: addColumn, remove: removeColumn }) => (
                  <div className="studio-matrix-columns">
                    {columnFields.map((columnField) => (
                      <div
                        key={columnField.key}
                        className="studio-matrix-col-card"
                      >
                        <Row
                          gutter={8}
                          align="middle"
                          className="studio-matrix-col-row"
                        >
                          <Col flex="auto">
                            <Form.Item
                              name={[columnField.name, "label"]}
                              rules={[
                                {
                                  required: true,
                                  message: "نام ستون را وارد کنید",
                                },
                              ]}
                              noStyle
                            >
                              <Input placeholder="عنوان ستون" />
                            </Form.Item>
                          </Col>
                          <Col flex="130px">
                            <Form.Item
                              name={[columnField.name, "type"]}
                              initialValue="text"
                              noStyle
                            >
                              <Select options={MATRIX_COLUMN_TYPES} />
                            </Form.Item>
                          </Col>
                          <Col flex="none">
                            <Button
                              danger
                              type="text"
                              size="small"
                              icon={<Trash2 size={14} />}
                              onClick={() => removeColumn(columnField.name)}
                            />
                          </Col>
                        </Row>
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) =>
                            getFieldValue([
                              "columns",
                              columnField.name,
                              "type",
                            ]) === "select" ? (
                              <Form.Item
                                name={[columnField.name, "optionsText"]}
                                noStyle
                              >
                                <Input
                                  size="small"
                                  placeholder="گزینه‌های این ستون را با , جدا کنید"
                                />
                              </Form.Item>
                            ) : null
                          }
                        </Form.Item>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      block
                      icon={<Plus size={14} />}
                      onClick={() => addColumn({ type: "text", label: "" })}
                    >
                      افزودن ستون
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          )}

          <Row
            gutter={12}
            style={hasPanel(activeType, "length") ? undefined : HIDE}
          >
            <Col span={12}>
              <Form.Item name="min_length" label="حداقل تعداد کاراکتر">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_length" label="حداکثر تعداد کاراکتر">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={12}
            style={
              hasPanel(activeType, "range") ||
              hasPanel(activeType, "rating") ||
              hasPanel(activeType, "matrix")
                ? undefined
                : HIDE
            }
          >
            <Col
              span={12}
              style={hasPanel(activeType, "rating") ? HIDE : undefined}
            >
              <Form.Item
                name="min_value"
                label={
                  hasPanel(activeType, "matrix")
                    ? "حداقل تعداد ردیف"
                    : "کمترین مقدار"
                }
              >
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_value"
                label={
                  hasPanel(activeType, "rating")
                    ? "بیشترین ستاره (۱ تا ۱۰)"
                    : hasPanel(activeType, "matrix")
                      ? "حداکثر تعداد ردیف"
                      : "بیشترین مقدار"
                }
              >
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={12}
            style={hasPanel(activeType, "file") ? undefined : HIDE}
          >
            <Col span={14}>
              <Form.Item name="allowed_extensions" label="پسوندهای مجاز">
                <Input dir="ltr" placeholder="pdf,docx,png" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="max_file_size_mb" label="حداکثر حجم (MB)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={12}
            style={hasPanel(activeType, "regex") ? undefined : HIDE}
          >
            <Col span={12}>
              <Form.Item name="regex_validation" label="قانون Regex">
                <Input dir="ltr" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="regex_error_message" label="پیام خطا">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="css_class" label="کلاس CSS (پیشرفته)">
            <Input dir="ltr" />
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
