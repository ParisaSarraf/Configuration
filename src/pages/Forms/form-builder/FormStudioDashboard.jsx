import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Popconfirm, Select, Spin, Tag } from "antd";
import { Eye, FileText, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { formApi } from "../../../Services/forms/formApi";
import FieldControl from "./FieldControl";
import FormCategoryModal from "../FormCategory/FormCategoryModal";
import useModal from "../../../hooks/useModal";

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

export default function FormStudioDashboard({
  categories,
  definitions,
  loading,
  myAxios,
  onCreate,
  onEdit,
  onDelete,
}) {
  const { setModal, modalData, modalMode, modalType, isOpen, closeModal } =
    useModal();

  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState();
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const visible = useMemo(
    () =>
      categoryId === "all"
        ? definitions
        : definitions.filter(
            (form) =>
              String(form.category?.id || form.category_id) ===
              String(categoryId),
          ),
    [categoryId, definitions],
  );
  const selected = visible.find((form) => form.id === selectedId) || visible[0];

  useEffect(() => {
    if (selected?.id) setSelectedId(selected.id);
  }, [selected?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!selected?.id) {
      setPreview(null);
      return undefined;
    }
    setPreviewLoading(true);
    formApi
      .getDefinition(myAxios, selected.id)
      .then((data) => {
        if (!cancelled) setPreview(Array.isArray(data) ? data[0] : data);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [myAxios, selected?.id]);

  return (
    <div className="form-studio-dashboard" dir="rtl">
      <header className="studio-dashboard-hero">
        <div>
          <span>FORM STUDIO</span>
          <h1>مدیریت فرم ها</h1>
          <p>دسته‌بندی، مشاهده و مدیریت فرم‌ها.</p>
        </div>
        <div className="dashboard-create">
          <Select
            value={categoryId}
            onChange={setCategoryId}
            options={[
              { value: "all", label: "همه دسته‌بندی‌ها" },
              ...categories.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() =>
              setModal({ data: null, type: "createCategory", mode: "add" })
            }
          >
            فرم جدید
          </Button>
        </div>
      </header>
      <div className="studio-dashboard-body">
        <aside className="studio-category-sidebar">
          <strong>دسته‌بندی‌ها</strong>
          <button
            className={categoryId === "all" ? "is-active" : ""}
            onClick={() => setCategoryId("all")}
          >
            همه فرم‌ها <span>{definitions.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={
                String(categoryId) === String(category.id) ? "is-active" : ""
              }
              onClick={() => setCategoryId(category.id)}
            >
              <FolderOpen size={14} />
              {category.name}
              <span>
                {
                  definitions.filter(
                    (form) =>
                      String(form.category?.id || form.category_id) ===
                      String(category.id),
                  ).length
                }
              </span>
            </button>
          ))}
        </aside>
        <main className="studio-form-list">
          {loading ? (
            <div className="dashboard-loading">
              <Spin />
            </div>
          ) : visible.length === 0 ? (
            <Empty description="فرمی در این دسته وجود ندارد" />
          ) : (
            <>
              {
                <div className="studio-list-heading">
                  <span>{visible.length} فرم</span>
                  <span>برای پیش‌نمایش، یک فرم را انتخاب کنید</span>
                </div>
              }
              {visible.map((form) => (
                <article
                  key={form.id}
                  className={`form-dashboard-card ${selected?.id === form.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(form.id)}
                >
                  <div className="form-card-main">
                    <Tag color={form.is_active ? "green" : "default"}>
                      {form.is_active ? "فعال" : "غیرفعال"}
                    </Tag>
                    <h3>{form.name}</h3>
                    <p>{form.description || "بدون توضیحات"}</p>
                  </div>
                  <div
                    className="dashboard-card-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      icon={<Pencil size={14} />}
                      onClick={() => onEdit(form.id)}
                    >
                      ویرایش
                    </Button>
                    <Popconfirm
                      title="این فرم حذف شود؟"
                      description="این عمل قابل بازگشت نیست."
                      okText="حذف"
                      cancelText="انصراف"
                      onConfirm={() => onDelete(form.id)}
                    >
                      <Button danger type="text" icon={<Trash2 size={15} />}>
                        حذف
                      </Button>
                    </Popconfirm>
                  </div>
                </article>
              ))}
            </>
          )}
        </main>
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
                      <FieldControl field={previewField(field)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
      <FormCategoryModal
        isOpen={modalType === "createCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        // refetch={refetch}
        closeModal={closeModal}
      />
    </div>
  );
}
