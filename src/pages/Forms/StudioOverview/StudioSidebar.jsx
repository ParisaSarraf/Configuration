import { DeleteOutlined, EditOutlined, FormOutlined } from "@ant-design/icons";
import { Button, message, Modal } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import {
  useDeleteFormCategory,
  formDefinitionsKey,
} from "../../../QueryServises/formsQuery";

export default function StudioSidebar({
  refetch,
  categories,
  categoryId,
  setCategoryId,
  definitions,
}) {
  const queryClient = useQueryClient();
  const deleteCategory = useDeleteFormCategory();

  const handleDelete = (category) => {
    Modal.confirm({
      title: "حذف دسته‌بندی",
      content: `آیا از حذف دسته‌بندی «${category.name}» مطمئن هستید؟`,
      okText: "حذف",
      cancelText: "انصراف",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          await deleteCategory.mutateAsync(category.id);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: formCategoriesKey }),
            queryClient.invalidateQueries({ queryKey: formDefinitionsKey }),
          ]);
          message.success("باموفقیت حذف شد.");
          refetch();
        } catch (error) {
          message.error("مشکلی پیش آمده است.");
          console.error(error);
        }
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
