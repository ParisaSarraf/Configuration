import { Button, Select } from "antd";
import { Plus } from "lucide-react";

export default function StudioHeader({ categoryId, setCategoryId, categories, definitionsCount, onOpenCreate }) {
  return (
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
        <Button type="primary" icon={<Plus size={16} />} onClick={onOpenCreate}>
          فرم جدید
        </Button>
      </div>
    </header>
  );
}