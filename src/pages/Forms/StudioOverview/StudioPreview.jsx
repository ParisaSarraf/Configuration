import { Button, Empty, Spin } from "antd";
import { Eye, FileText, Pencil } from "lucide-react";
// import FieldControl from "./FieldControl";

const previewField = (field) => ({
  ...field,
  type:
    { text: "shortText", textarea: "longText" }[field.field_type] ||
    field.field_type ||
    "shortText",
  label: field.field_label || "",
  helperText: field.help_text || "",
  placeholder: field.placeholder || "",
  options: field.choices || [],
});

export default function StudioPreview({
  selected,
  preview,
  previewLoading,
  onEdit,
}) {
  return (
    <aside className="studio-preview-panel">
      {!selected ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="یک فرم را انتخاب کنید"
        />
      ) : previewLoading ? (
        <div className="dashboard-loading">
          <Spin />
        </div>
      ) : (
        <>
          <div className="preview-panel-heading">
            <span>
              <Eye size={16} /> پیش‌نمایش زنده
            </span>
            <Button
              size="small"
              icon={<Pencil size={13} />}
              onClick={() => onEdit(selected.id)}
            >
              ویرایش فرم
            </Button>
          </div>
          <div className="studio-preview-scroll">
            <div className="studio-preview-sheet">
              <span className="studio-preview-badge">
                <FileText size={13} />
                {selected.category?.name || "فرم"}
              </span>
              <h2>{preview?.name || selected.name}</h2>
              <p>{preview?.description || selected.description}</p>
              {(preview?.fields || []).map((field) => (
                <div className="studio-preview-field" key={field.id}>
                  <label>
                    {field.field_label}
                    {field.required && <b>*</b>}
                  </label>
                  {field.help_text && <small>{field.help_text}</small>}
                  {/* <FieldControl field={previewField(field)} /> */}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
