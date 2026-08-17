/* eslint-disable react/prop-types */
import { Button, Segmented, Tooltip } from "antd";
import {
  BarChart3,
  Check,
  Cloud,
  Eye,
  MoreHorizontal,
  PenLine,
  Send,
  Sparkles,
} from "lucide-react";

const VIEW_OPTIONS = [
  { value: "edit", label: <span><PenLine size={14} /> ویرایش</span> },
  { value: "preview", label: <span><Eye size={14} /> پیش‌نمایش</span> },
  { value: "responses", label: <span><BarChart3 size={14} /> پاسخ‌ها</span> },
];

const saveText = {
  idle: "ذخیره نشده",
  dirty: "تغییرات ذخیره نشده",
  saving: "در حال ذخیره...",
  saved: "همه تغییرات ذخیره شد",
};

export default function BuilderHeader({
  title,
  viewMode,
  saveState,
  fieldCount,
  onTitleChange,
  onViewChange,
  onSave,
  onPublish,
  onSettings,
}) {
  return (
    <header className="builder-header">
      <div className="builder-brand-block">
        <div className="builder-brand-mark"><Sparkles size={16} /></div>
        <div className="builder-title-wrap">
          <div className="builder-title-line">
            <input
              aria-label="عنوان فرم"
              className="builder-title-input"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              maxLength={70}
            />
            <span className="draft-pill">پیش‌نویس</span>
          </div>
          <span className={`save-indicator save-indicator--${saveState}`}>
            {saveState === "saved" ? <Check size={11} /> : <Cloud size={11} />}
            {saveText[saveState]}
            <i />
            {fieldCount.toLocaleString("fa-IR")} فیلد
          </span>
        </div>
      </div>

      <Segmented
        className="builder-mode-switch"
        value={viewMode}
        options={VIEW_OPTIONS}
        onChange={onViewChange}
      />

      <div className="builder-header-actions">
        <Button onClick={onSave} loading={saveState === "saving"}>ذخیره پیش‌نویس</Button>
        <Button type="primary" icon={<Send size={14} />} onClick={onPublish}>انتشار فرم</Button>
        <Tooltip title="تنظیمات فرم">
          <Button className="icon-only-button" icon={<MoreHorizontal size={18} />} onClick={onSettings} />
        </Tooltip>
      </div>
    </header>
  );
}
