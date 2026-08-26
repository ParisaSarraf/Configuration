import { useState } from "react";
import { Button, Tooltip } from "antd";
import {
  DeleteOutlined,
  FormOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FolderOpen, Folder, Layers3, Plus } from "lucide-react";
import FormCategoryModal from "../../FormCategoryModal";

const CategoryLeftSidebar = ({
  category = [],
  definitions = [],
  refetch,
  isOpen,
  setModal,
  closeModal,
  modalMode,
  modalType,
  modalData,
}) => {
  const [categoryId, setCategoryId] = useState("all");

  const categories = category ?? [];
  const forms = definitions ?? [];

  const handleDelete = (selectedCategory) => {
    console.log("Delete category:", selectedCategory);
  };

  const handleForm = (selectedCategory) => {
    console.log("Add form to category:", selectedCategory);
  };

  const handleEdit = (selectedCategory) => {
    console.log("Edit category:", selectedCategory);
  };

  return (
    <aside className="flex h-full min-h-[500px] w-full flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers3 size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-800">دسته‌بندی‌ها</h2>

              <p className="mt-0.5 text-[11px] text-gray-400">
                مدیریت دسته‌بندی فرم‌ها
              </p>
            </div>
          </div>
        </div>

        {/* Add category */}
        <Tooltip title="دسته‌بندی جدید">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() =>
              setModal({ mode: "add", data: null, type: "createCategory" })
            }
            className="flex items-center rounded-lg font-medium"
          />

          <FormCategoryModal
            refetch={refetch}
            isOpen={modalType === "createCategory" && isOpen}
            modalData={modalData}
            modalMode={modalMode}
            closeModal={closeModal}
          />
        </Tooltip>
      </div>

      {/* Category List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Folder size={22} />
            </div>

            <p className="text-sm font-medium text-gray-600">
              دسته‌بندی‌ای وجود ندارد
            </p>

            <p className="mt-1 text-xs text-gray-400">
              اولین دسته‌بندی خود را ایجاد کنید
            </p>
          </div>
        ) : (
          categories.map((item) => {
            const count = forms.filter(
              (form) =>
                String(form.category?.id || form.category_id) ===
                String(item.id),
            ).length;

            const isActive = String(categoryId) === String(item.id);

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-1 rounded-xl p-1 transition-all ${
                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Category */}
                <button
                  type="button"
                  onClick={() => setCategoryId(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-right"
                >
                  {/* Folder Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    {isActive ? <FolderOpen size={17} /> : <Folder size={17} />}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-sm font-medium ${
                        isActive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-gray-400">
                      {item.slug}
                    </div>
                  </div>

                  {/* Count */}
                  <span
                    className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-medium ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {/* Actions */}
                <div
                  className={`flex items-center gap-0.5 transition-opacity ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {/* Add Form */}
                  <Tooltip title="افزودن فرم">
                    <Button
                      type="text"
                      size="small"
                      className="!flex !h-7 !w-7 !items-center !justify-center !p-0 !text-gray-400 hover:!bg-green-50 hover:!text-green-600"
                      icon={<FormOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForm(item);
                      }}
                    />
                  </Tooltip>

                  {/* Edit */}
                  <Tooltip title="ویرایش">
                    <Button
                      type="text"
                      size="small"
                      className="!flex !h-7 !w-7 !items-center !justify-center !p-0 !text-gray-400 hover:!bg-blue-50 hover:!text-blue-600"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    />
                  </Tooltip>

                  {/* Delete */}
                  <Tooltip title="حذف">
                    <Button
                      type="text"
                      danger
                      size="small"
                      className="!flex !h-7 !w-7 !items-center !justify-center !p-0 !text-gray-400 hover:!bg-red-50 hover:!text-red-600"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default CategoryLeftSidebar;
