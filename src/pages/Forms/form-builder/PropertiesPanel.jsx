/* eslint-disable react/prop-types */
import { Button, Divider, Input, InputNumber, Select, Switch, Tabs, Tooltip } from "antd";
import {
  AlertCircle,
  ListChecks,
  Plus,
  Settings2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { getFieldMeta } from "./fieldConfig";
import { slugify } from "../../../Services/forms/formPayloads";

const { TextArea } = Input;

function Property({ label, hint, children }) {
  return (
    <div className="property-group">
      <label>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function OptionsEditor({ options = [], onChange }) {
  const update = (index, value) => onChange(options.map((option, i) => i === index ? value : option));
  const remove = (index) => onChange(options.filter((_, i) => i !== index));

  return (
    <Property label="گزینه‌های پاسخ">
      <div className="option-list">
        {options.map((option, index) => (
          <div className="option-row" key={index}>
            <span>{(index + 1).toLocaleString("fa-IR")}</span>
            <Input value={option} onChange={(event) => update(index, event.target.value)} />
            <Tooltip title="حذف گزینه"><Button type="text" danger icon={<X size={13} />} onClick={() => remove(index)} /></Tooltip>
          </div>
        ))}
        <Button
          className="add-option-button"
          type="dashed"
          icon={<Plus size={13} />}
          onClick={() => onChange([...options, `گزینه ${options.length + 1}`])}
        >
          افزودن گزینه
        </Button>
      </div>
    </Property>
  );
}

function ContentSettings({ field, set }) {
  const supportsPlaceholder = ["shortText", "longText", "select", "number", "date"].includes(field.type);
  return (
    <div className="property-tab-content">
      <Property label="عنوان سؤال">
        <TextArea value={field.label} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => set({ label: event.target.value })} />
      </Property>

      <Property label="نام فنی فیلد" hint="این مقدار به‌عنوان کلید form_data و field_name ارسال می‌شود.">
        <Input
          dir="ltr"
          value={field.fieldName || slugify(field.label)}
          onChange={(event) => set({ fieldName: slugify(event.target.value) })}
        />
      </Property>

      {supportsPlaceholder && (
        <Property label="متن جایگزین" hint="پیش از وارد کردن پاسخ نمایش داده می‌شود.">
          <Input value={field.placeholder} onChange={(event) => set({ placeholder: event.target.value })} />
        </Property>
      )}

      <Property label="متن راهنما">
        <TextArea
          value={field.helperText}
          placeholder="توضیح کوتاهی برای پاسخ‌دهنده بنویسید..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          onChange={(event) => set({ helperText: event.target.value })}
        />
      </Property>

      <div className="property-grid">
        <Property label="مقدار پیش‌فرض"><Input value={field.defaultValue} onChange={(event) => set({ defaultValue: event.target.value })} /></Property>
        <Property label="کلاس CSS"><Input dir="ltr" value={field.cssClass} onChange={(event) => set({ cssClass: event.target.value })} /></Property>
      </div>

      {field.type === "select" && <OptionsEditor options={field.options} onChange={(options) => set({ options })} />}

      {field.type === "number" && (
        <Property label="واحد مقدار">
          <Input value={field.suffix} placeholder="مثلاً سال یا نفر" onChange={(event) => set({ suffix: event.target.value })} />
        </Property>
      )}

      {field.type === "rating" && (
        <Property label="تعداد ستاره‌ها">
          <InputNumber min={3} max={10} value={field.maxRating} onChange={(value) => set({ maxRating: value || 5 })} />
        </Property>
      )}

      <Divider />
      <div className="property-switch-row">
        <div><strong>پاسخ اجباری</strong><small>بدون پاسخ، فرم ارسال نمی‌شود.</small></div>
        <Switch checked={field.required} onChange={(required) => set({ required })} />
      </div>
    </div>
  );
}

function ValidationSettings({ field, set }) {
  const isText = ["shortText", "longText"].includes(field.type);
  const isNumber = field.type === "number";
  return (
    <div className="property-tab-content">
      <div className="validation-note"><AlertCircle size={15} /><span>قوانین اعتبارسنجی هنگام ارسال پاسخ بررسی می‌شوند.</span></div>

      {isText && (
        <>
          <Property label="نوع اعتبارسنجی">
            <Select
              value={field.validation}
              onChange={(validation) => set({ validation })}
              options={[
                { value: "none", label: "بدون محدودیت" },
                { value: "email", label: "نشانی ایمیل" },
                { value: "url", label: "آدرس وب" },
                { value: "phone", label: "شماره تماس" },
              ]}
            />
          </Property>
          <div className="property-grid">
            <Property label="حداقل کاراکتر"><InputNumber min={0} value={field.minLength} onChange={(value) => set({ minLength: value || 0 })} /></Property>
            <Property label="حداکثر کاراکتر"><InputNumber min={1} value={field.maxLength} onChange={(value) => set({ maxLength: value || 1 })} /></Property>
          </div>
          <Property label="الگوی Regex سفارشی" hint="در صورت ورود، بر الگوی آماده اولویت دارد.">
            <Input dir="ltr" value={field.regexValidation} onChange={(event) => set({ regexValidation: event.target.value })} />
          </Property>
          <Property label="پیام خطای اعتبارسنجی">
            <Input value={field.regexErrorMessage} onChange={(event) => set({ regexErrorMessage: event.target.value })} />
          </Property>
        </>
      )}

      {isNumber && (
        <div className="property-grid">
          <Property label="کمترین مقدار"><InputNumber value={field.min} onChange={(min) => set({ min })} /></Property>
          <Property label="بیشترین مقدار"><InputNumber value={field.max} onChange={(max) => set({ max })} /></Property>
        </div>
      )}

      {field.type === "file" && (
        <>
          <Property label="پسوندهای مجاز" hint="با کاما جدا کنید؛ مانند pdf,docx,png">
            <Input dir="ltr" value={field.allowedExtensions} onChange={(event) => set({ allowedExtensions: event.target.value })} />
          </Property>
          <Property label="حداکثر حجم فایل (MB)">
            <InputNumber min={0} value={field.maxFileSizeMb} onChange={(maxFileSizeMb) => set({ maxFileSizeMb: maxFileSizeMb || 0 })} />
          </Property>
        </>
      )}

      {!isText && !isNumber && field.type !== "file" && (
        <div className="property-placeholder"><ListChecks size={22} /><strong>تنظیم اضافه‌ای نیاز نیست</strong><span>این نوع فیلد به‌صورت خودکار اعتبارسنجی می‌شود.</span></div>
      )}
    </div>
  );
}

export default function PropertiesPanel({ field, onChange, onDelete }) {
  if (!field) {
    return (
      <aside className="builder-panel properties-panel properties-panel--empty" dir="rtl">
        <span><Settings2 size={21} /></span>
        <h3>فیلدی انتخاب نشده</h3>
        <p>برای مشاهده و ویرایش ویژگی‌ها، یک فیلد را در بوم انتخاب کنید.</p>
      </aside>
    );
  }

  const { icon: Icon, label: typeLabel } = getFieldMeta(field.type);
  const set = (patch) => onChange(field.id, patch);
  const items = [
    { key: "content", label: <span><SlidersHorizontal size={13} /> محتوا</span>, children: <ContentSettings field={field} set={set} /> },
    { key: "validation", label: <span><ListChecks size={13} /> اعتبارسنجی</span>, children: <ValidationSettings field={field} set={set} /> },
  ];

  return (
    <aside className="builder-panel properties-panel" dir="rtl" aria-label="تنظیمات فیلد انتخاب‌شده">
      <div className="property-heading">
        <div className="property-heading-icon"><Icon size={16} /></div>
        <div><h2>ویژگی‌های فیلد</h2><p>{typeLabel}</p></div>
        <span className="property-live-dot">فعال</span>
      </div>

      <Tabs className="property-tabs" defaultActiveKey="content" items={items} />

      <div className="property-footer">
        <Button danger icon={<Trash2 size={14} />} onClick={() => onDelete(field.id)}>حذف این فیلد</Button>
        <span>شناسه: {field.id.slice(0, 8)}</span>
      </div>
    </aside>
  );
}
