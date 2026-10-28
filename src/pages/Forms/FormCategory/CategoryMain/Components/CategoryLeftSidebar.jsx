import { Button, Modal, Tooltip } from "antd";
import { DeleteOutlined, FormOutlined, EditOutlined } from "@ant-design/icons";
import { FolderOpen, Folder, Plus } from "lucide-react";
import FormCategoryModal from "../../FormCategoryModal";
import { useDeleteFormCategory } from "../../../../../QueryServises/formsQuery";
import FormDefinitionModal from "../../../FormDefinition/Components/FormDefinitionModal";
import { StoredIcon } from "../../../../../components/IconPicker/Index";

// پالت رنگی برای متمایز شدن دسته‌بندی‌ها
const PALETTE = [
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
  {
    idle: "theme-accent-soft theme-accent",
    active: "theme-gradient theme-on-accent",
    row: "theme-accent-soft-80 ring-1 theme-ring-accent-border",
    text: "theme-accent",
    badge: "theme-accent-bg theme-on-accent",
  },
];

const CategoryLeftSidebar = ({
  category = [],
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

  const handleDelete = (item) => {
    Modal.confirm({
      title: "حذف دسته‌بندی",
      content: (
        <div>
          آیا از حذف دسته‌بندی{" "}
          <strong className="text-red-500">«{item.name}»</strong> مطمئن هستید؟
          <div className="mt-2 text-xs theme-muted">
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
        <Button
          type="primary"
          icon={<Plus size={15} />}
          onClick={() =>
            setModal({
              mode: "add",
              data: null,
              type: "createCategory",
            })
          }
          className="!mb-3 !flex !h-9 !w-full !items-center !justify-center !gap-1 !rounded-xl !border-none !bg-gradient-to-l !theme-gradient !theme-gradient !text-xs !font-bold shadow-sm hover:!opacity-90"
        >
          دسته‌بندی جدید
        </Button>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pl-0.5">
          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed theme-accent-border theme-accent-soft-50 p-4 text-center text-[11px] theme-accent">
              هنوز دسته‌بندی‌ای ساخته نشده است.
            </div>
          )}

          {categories.map((item, index) => {
            const isActive = String(categoryId) === String(item.id);
            const color = PALETTE[index % PALETTE.length];

            return (
              <div
                key={item.id}
                className={`group flex items-center rounded-xl transition ${
                  isActive ? color.row : "hover:theme-canvas"
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
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                        isActive ? color.active : color.idle
                      }`}
                    >
                      <StoredIcon
                        value={item.icon}
                        fallback={
                          isActive ? (
                            <FolderOpen size={14} />
                          ) : (
                            <Folder size={14} />
                          )
                        }
                        size={14}
                        style={{ fontSize: 14 }}
                      />
                    </span>

                    <span
                      className={`min-w-0 flex-1 truncate text-xs ${
                        isActive
                          ? `font-bold ${color.text}`
                          : "font-medium theme-text"
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
                      className="!h-6 !w-6 !rounded-lg !p-0 !theme-muted hover:!bg-emerald-100 hover:!text-emerald-600"
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
                      className="!h-6 !w-6 !rounded-lg !p-0 !theme-muted hover:!theme-accent-soft hover:!theme-accent"
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
                      className="!h-6 !w-6 !rounded-lg !p-0 hover:!bg-rose-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    />
                  </Tooltip>
                </div>

                <span
                  className={`mx-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-bold ${
                    isActive ? color.badge : "theme-panel theme-muted"
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
