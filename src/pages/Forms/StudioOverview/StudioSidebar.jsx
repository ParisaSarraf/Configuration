import { FolderOpen } from "lucide-react";

export default function StudioSidebar({ categories, categoryId, setCategoryId, definitions }) {
  return (
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
          className={String(categoryId) === String(category.id) ? "is-active" : ""}
          onClick={() => setCategoryId(category.id)}
        >
          <FolderOpen size={14} />
          {category.name}
          <span>
            {
              definitions.filter(
                (form) => String(form.category?.id || form.category_id) === String(category.id)
              ).length
            }
          </span>
        </button>
      ))}
    </aside>
  );
}