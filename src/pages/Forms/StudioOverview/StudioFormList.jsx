import { Button, Empty, Popconfirm, Spin, Tag } from "antd";
import { Pencil, Trash2 } from "lucide-react";

export default function StudioFormList({ loading, visible, selectedId, setSelectedId, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin />
      </div>
    );
  }

  if (visible.length === 0) {
    return <Empty description="فرمی در این دسته وجود ندارد" />;
  }

  return (
    <main className="studio-form-list">
      <div className="studio-list-heading">
        <span>{visible.length} فرم</span>
        <span>برای پیش‌نمایش، یک فرم را انتخاب کنید</span>
      </div>
      {visible.map((form) => (
        <article
          key={form.id}
          className={`form-dashboard-card ${selectedId === form.id ? "is-selected" : ""}`}
          onClick={() => setSelectedId(form.id)}
        >
          <div className="form-card-main">
            <Tag color={form.is_active ? "green" : "default"}>
              {form.is_active ? "فعال" : "غیرفعال"}
            </Tag>
            <h3>{form.name}</h3>
            <p>{form.description || "بدون توضیحات"}</p>
          </div>
          <div className="dashboard-card-actions" onClick={(event) => event.stopPropagation()}>
            <Button icon={<Pencil size={14} />} onClick={() => onEdit(form.id)}>
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
    </main>
  );
}