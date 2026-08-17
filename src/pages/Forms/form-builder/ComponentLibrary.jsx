/* eslint-disable react/prop-types */
import { Input, Tooltip } from "antd";
import { Blocks, GripVertical, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { FIELD_TYPES } from "./fieldConfig";

export default function ComponentLibrary({ onAdd }) {
  const [query, setQuery] = useState("");
  const visibleTypes = useMemo(() => FIELD_TYPES.filter((item) => (
    `${item.label} ${item.description}`.includes(query.trim())
  )), [query]);

  const beginDrag = (event, type) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-form-field", type);
  };

  return (
    <aside className="builder-panel component-library" dir="rtl" aria-label="کتابخانه اجزای فرم">
      <div className="panel-heading">
        <div className="panel-heading-icon"><Blocks size={16} /></div>
        <div>
          <h2>اجزای فرم</h2>
          <p>برای افزودن کلیک یا به بوم بکشید</p>
        </div>
      </div>

      <div className="library-search">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجوی اجزا..."
          prefix={<Search size={14} />}
          allowClear
        />
      </div>

      <div className="library-section-label"><span>فیلدهای ورودی</span><b>{visibleTypes.length.toLocaleString("fa-IR")}</b></div>
      <div className="library-items">
        {visibleTypes.map(({ type, label, description, icon: Icon }) => (
          <button
            type="button"
            draggable
            className="library-item"
            key={type}
            onDragStart={(event) => beginDrag(event, type)}
            onClick={() => onAdd(type)}
          >
            <GripVertical className="library-grip" size={13} />
            <span className="library-item-icon"><Icon size={16} /></span>
            <span className="library-item-copy"><strong>{label}</strong><small>{description}</small></span>
            <Tooltip title="افزودن به انتهای فرم" placement="left">
              <span className="library-add"><Plus size={14} /></span>
            </Tooltip>
          </button>
        ))}
        {!visibleTypes.length && <div className="library-empty">جزئی با این نام پیدا نشد.</div>}
      </div>

      <div className="library-tip">
        <Sparkles size={15} />
        <p><strong>نکته حرفه‌ای</strong><span>فیلد را دقیقاً میان دو سؤال رها کنید.</span></p>
      </div>
    </aside>
  );
}
