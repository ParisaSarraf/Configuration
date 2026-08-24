import { Button, Select } from "antd";
import { Plus } from "lucide-react";

export default function StudioHeader({ categoryId, setCategoryId, categories, definitionsCount, onOpenCreate }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-7 bg-blue-600 rounded-full"></div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 m-0 leading-tight">مدیریت فرم‌ها</h1>
          <span className="text-xs text-gray-400 font-medium">{definitionsCount} فرم ثبت شده</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={categoryId}
          onChange={setCategoryId}
          variant="borderless"
          className="bg-gray-50 border border-gray-200 rounded-lg min-w-[160px]"
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
          onClick={onOpenCreate}
          className="flex items-center rounded-lg font-medium"
        >
          فرم جدید
        </Button>
      </div>
    </header>
  );
}