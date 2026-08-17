/* eslint-disable react/prop-types */
import { Avatar, Button, Empty, Tooltip } from "antd";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  GripVertical,
  LayoutTemplate,
  Maximize2,
  MoreHorizontal,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import FieldControl from "./FieldControl";
import { getFieldMeta } from "./fieldConfig";

function CanvasToolbar({ viewMode, fields }) {
  return (
    <div className="canvas-toolbar" dir="rtl">
      <div>
        <span className="canvas-breadcrumb">فرم‌ها <i>/</i> فضای ساخت</span>
        <span className="canvas-view-name">
          {viewMode === "edit" ? "ساختار فرم" : viewMode === "preview" ? "پیش‌نمایش نهایی" : "گزارش پاسخ‌ها"}
        </span>
      </div>
      <div className="canvas-toolbar-actions">
        <span className="collaborators-label">همکاران</span>
        <Avatar.Group size={27} max={{ count: 3 }}>
          <Avatar style={{ color: "#684d28", background: "#f3e8d5" }}>م</Avatar>
          <Avatar style={{ color: "#315a75", background: "#e0eff7" }}>س</Avatar>
          <Avatar style={{ color: "#654b73", background: "#eee6f2" }}>ن</Avatar>
        </Avatar.Group>
        <i className="toolbar-divider" />
        <Tooltip title={`${fields.length.toLocaleString("fa-IR")} فیلد`}><Button type="text" icon={<LayoutTemplate size={15} />} /></Tooltip>
        <Tooltip title="تمام صفحه"><Button type="text" icon={<Maximize2 size={15} />} /></Tooltip>
      </div>
    </div>
  );
}

function FieldCard({ field, index, selected, onSelect, onDuplicate, onDelete, onDragStart, onDragEnd }) {
  const { icon: Icon, label: typeLabel } = getFieldMeta(field.type);

  return (
    <article
      className={`builder-field-card ${selected ? "is-selected" : ""}`}
      dir="rtl"
      draggable
      tabIndex={0}
      onDragStart={(event) => onDragStart(event, index)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(field.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(field.id);
      }}
    >
      <div className="field-accent" />
      <button className="field-drag-handle" aria-label="جابجایی فیلد" type="button"><GripVertical size={17} /></button>
      <div className="field-card-body">
        <div className="field-card-meta">
          <span className="field-index">{(index + 1).toLocaleString("fa-IR").padStart(2, "۰")}</span>
          <span className="field-type"><Icon size={13} />{typeLabel}</span>
        </div>
        <label className="field-question">
          {field.label || "بدون عنوان"}
          {field.required && <b>*</b>}
        </label>
        {field.helperText && <p className="field-helper">{field.helperText}</p>}
        <div className="field-preview-control" onClick={(event) => event.stopPropagation()}>
          <FieldControl field={field} />
        </div>
      </div>
      <div className="field-card-actions" onClick={(event) => event.stopPropagation()}>
        <Tooltip title="تنظیمات"><Button type="text" icon={<Settings2 size={15} />} onClick={() => onSelect(field.id)} /></Tooltip>
        <Tooltip title="تکثیر"><Button type="text" icon={<Copy size={15} />} onClick={() => onDuplicate(field.id)} /></Tooltip>
        <Tooltip title="حذف"><Button danger type="text" icon={<Trash2 size={15} />} onClick={() => onDelete(field.id)} /></Tooltip>
      </div>
    </article>
  );
}

function DropZone({ active, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      className={`field-drop-zone ${active ? "is-active" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <span><Plus size={13} /> اینجا رها کنید</span>
    </div>
  );
}

function EditorCanvas({ fields, selectedId, onSelect, onAdd, onDuplicate, onDelete, onReorder }) {
  const dragIndex = useRef(null);
  const [dropIndex, setDropIndex] = useState(null);

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();
    event.stopPropagation();
    const libraryType = event.dataTransfer.getData("application/x-form-field");
    if (libraryType) onAdd(libraryType, targetIndex);
    else if (dragIndex.current !== null) {
      const adjustedIndex = dragIndex.current < targetIndex ? targetIndex - 1 : targetIndex;
      onReorder(dragIndex.current, adjustedIndex);
    }
    dragIndex.current = null;
    setDropIndex(null);
  };

  const dragZoneProps = (index) => ({
    active: dropIndex === index,
    onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDropIndex(index); },
    onDragLeave: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropIndex(null); },
    onDrop: (event) => handleDrop(event, index),
  });

  if (!fields.length) {
    const emptyDropProps = dragZoneProps(0);
    return (
      <div
        className={`empty-builder-canvas ${emptyDropProps.active ? "is-active" : ""}`}
        dir="rtl"
        onDragOver={emptyDropProps.onDragOver}
        onDragLeave={emptyDropProps.onDragLeave}
        onDrop={emptyDropProps.onDrop}
      >
        <span className="empty-builder-icon"><LayoutTemplate size={25} /></span>
        <h3>اولین سؤال فرم را اضافه کنید</h3>
        <p>یکی از اجزای پنل سمت چپ را بکشید و اینجا رها کنید.</p>
      </div>
    );
  }

  return (
    <div className="field-list">
      <DropZone {...dragZoneProps(0)} />
      {fields.map((field, index) => (
        <div key={field.id}>
          <FieldCard
            field={field}
            index={index}
            selected={field.id === selectedId}
            onSelect={onSelect}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onDragStart={(event, fieldIndex) => {
              dragIndex.current = fieldIndex;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("application/x-builder-index", String(fieldIndex));
            }}
            onDragEnd={() => { dragIndex.current = null; setDropIndex(null); }}
          />
          <DropZone {...dragZoneProps(index + 1)} />
        </div>
      ))}
    </div>
  );
}

function PreviewCanvas({ title, description, fields }) {
  return (
    <div className="form-preview" dir="rtl">
      <div className="preview-brand"><span>F</span> FORMA STUDIO</div>
      <div className="preview-head">
        <span className="preview-eyebrow">فرم آنلاین</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="preview-fields">
        {fields.map((field, index) => (
          <div className="preview-field" key={field.id}>
            <span className="preview-field-number">{(index + 1).toLocaleString("fa-IR")}</span>
            <label>{field.label}{field.required && <b>*</b>}</label>
            {field.helperText && <p>{field.helperText}</p>}
            <FieldControl field={field} interactive />
          </div>
        ))}
      </div>
      <Button type="primary" size="large" icon={<CheckCircle2 size={16} />}>ثبت و ارسال پاسخ</Button>
      <small className="preview-footnote">اطلاعات شما نزد ما محفوظ می‌ماند.</small>
    </div>
  );
}

function ResponsesCanvas() {
  const cards = [
    { label: "کل پاسخ‌ها", value: "۰", icon: BarChart3 },
    { label: "بازدید فرم", value: "۰", icon: Users },
    { label: "نرخ تکمیل", value: "۰٪", icon: CheckCircle2 },
  ];
  return (
    <div className="responses-view" dir="rtl">
      <div className="response-stats">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="response-stat"><span><Icon size={16} /></span><p>{label}<strong>{value}</strong></p><MoreHorizontal size={15} /></div>
        ))}
      </div>
      <div className="responses-empty">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        <h3>هنوز پاسخی دریافت نشده است</h3>
        <p>پس از انتشار فرم، پاسخ‌های جدید همراه با آمار تکمیل در این بخش نمایش داده می‌شوند.</p>
      </div>
    </div>
  );
}

export default function FormCanvas(props) {
  return (
    <main className="builder-canvas" dir="ltr">
      <CanvasToolbar viewMode={props.viewMode} fields={props.fields} />
      <div className={`canvas-scroll canvas-scroll--${props.viewMode}`}>
        {props.viewMode === "edit" && <EditorCanvas {...props} />}
        {props.viewMode === "preview" && <PreviewCanvas {...props} />}
        {props.viewMode === "responses" && <ResponsesCanvas />}
      </div>
    </main>
  );
}
