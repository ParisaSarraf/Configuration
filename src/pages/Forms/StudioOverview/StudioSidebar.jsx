import { DeleteOutlined, EditOutlined, FormOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { FolderOpen } from "lucide-react";
import { useFormApiMutations } from "../../../QueryServises/formsQuery";

export default function StudioSidebar({
  categories,
  categoryId,
  setCategoryId,
  definitions,
}) {
  const { category } = useFormApiMutations();

  const handleDelete = (category) => {
    console.log(category);

    Modal.confirm({
      title: "حذف دسته‌بندی",
      content: `آیا از حذف دسته‌بندی «${category.name}» مطمئن هستید؟`,
      okText: "حذف",
      cancelText: "انصراف",
      okButtonProps: {
        danger: true,
      },
      onOk: async() => {
        await category
        console.log("Delete category:", category.id);
      },
    });
  };

  const handleEdit = (category) => {
    // TODO: edit category
    console.log("Edit category:", category.id);
  };

  const handleForm = (category) => {
    // TODO: create form in this category
    console.log("Create form:", category.id);
  };

  return (
    <aside className="studio-category-sidebar">
      <strong>دسته‌بندی‌ها</strong>

      <button
        className={categoryId === "all" ? "is-active" : ""}
        onClick={() => setCategoryId("all")}
      >
        همه فرم‌ها <span>{definitions.length}</span>
      </button>

      {categories.map((category) => {
        const count = definitions.filter(
          (form) =>
            String(form.category?.id || form.category_id) ===
            String(category.id),
        ).length;

        return (
          <div className="flex flex-row items-center" key={category.id}>
            <Button
              className={
                String(categoryId) === String(category.id) ? "is-active" : ""
              }
              onClick={() => setCategoryId(category.id)}
            >
              <FolderOpen size={14} />
              {category.name}
              <span>{count}</span>
            </Button>

            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(category);
              }}
            />

            <Button
              icon={<FormOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleForm(category);
              }}
            />

            <Button
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(category);
              }}
            />
          </div>
        );
      })}
    </aside>
  );
}
