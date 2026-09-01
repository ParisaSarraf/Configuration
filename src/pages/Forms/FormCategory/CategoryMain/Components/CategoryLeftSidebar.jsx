import { Button, Modal, Tooltip } from "antd";
import { DeleteOutlined, FormOutlined, EditOutlined } from "@ant-design/icons";
import { FolderOpen, Folder, Layers3, Plus } from "lucide-react";
import FormCategoryModal from "../../FormCategoryModal";
import { useDeleteFormCategory } from "../../../../../QueryServises/formsQuery";
import FormDefinitionModal from "../../../FormDefinition/Components/FormDefinitionModal";

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
  categoryId,
  setCategoryId,
}) => {
  const { mutateAsync: deleteCategory } = useDeleteFormCategory();

  const categories = category ?? [];
  const forms = definitions ?? [];

  const handleDelete = (item) => {
    Modal.confirm({
      title: "حذف دسته‌بندی",
      content: (
        <div>
          آیا از حذف دسته‌بندی{" "}
          <strong className="text-red-500">«{item.name}»</strong> مطمئن هستید؟
          <div className="mt-2 text-xs text-gray-500">
            این عملیات قابل بازگشت نیست.
          </div>
        </div>
      ),
      okText: "حذف",
      cancelText: "انصراف",
      okType: "danger",
      centered: true,
      onOk: async () => {
        try {
          await deleteCategory(item.id);
          await refetch();
        } catch (error) {
          console.error("Delete category error:", error);
        }
      },
    });
  };

  const handleForm = (item) => {
    setModal({
      mode: "add",
      data: item,
      type: "createFormDefinitionCategory",
    });
  };

  const handleEdit = (item) => {
    setModal({ mode: "edit", data: item, type: "createCategory" });
  };

  return (
    <>
      <aside className="flex h-full min-h-0 w-full flex-col">
        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers3 size={16} />
            </div>

            <div>
              <h2 className="text-xs font-bold text-gray-800">دسته‌بندی‌ها</h2>

              <p className="text-[10px] text-gray-400">
                مدیریت دسته‌بندی فرم‌ها
              </p>
            </div>
          </div>

          <Tooltip title="دسته‌بندی جدید">
            <Button
              type="primary"
              size="small"
              icon={<Plus size={14} />}
              onClick={() =>
                setModal({
                  mode: "add",
                  data: null,
                  type: "createCategory",
                })
              }
              className="!flex !h-7 !w-7 !items-center !justify-center !p-0"
            />
          </Tooltip>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {categories.map((item) => {
            const isActive = String(categoryId) === String(item.id);

            return (
              <div
                key={item.id}
                className={`group flex items-center rounded-lg transition ${
                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <Tooltip
                  title={item.name}
                  placement="top"
                  mouseEnterDelay={0.5}
                >
                  <button
                    type="button"
                    onClick={() => setCategoryId(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-right"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isActive ? (
                        <FolderOpen size={14} />
                      ) : (
                        <Folder size={14} />
                      )}
                    </span>

                    <span
                      className={`min-w-0 flex-1 truncate text-xs font-medium ${
                        isActive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                </Tooltip>

                <div
                  className={`flex shrink-0 items-center transition-opacity ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Tooltip title="افزودن فرم">
                    <Button
                      type="text"
                      size="small"
                      icon={<FormOutlined />}
                      className="!h-6 !w-6 !p-0 !text-gray-400 hover:!bg-green-50 hover:!text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForm(item);
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="ویرایش">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      className="!h-6 !w-6 !p-0 !text-gray-400 hover:!bg-blue-50 hover:!text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="حذف">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      className="!h-6 !w-6 !p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    />
                  </Tooltip>
                </div>

                <span
                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-2 mx-2 text-[10px] ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.number_of_forms}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
      <FormCategoryModal
        refetch={refetch}
        isOpen={modalType === "createCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        closeModal={closeModal}
      />
      <FormDefinitionModal
        refetch={refetch}
        isOpen={modalType === "createFormDefinitionCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        closeModal={closeModal}
      />
    </>
  );
};

export default CategoryLeftSidebar;
