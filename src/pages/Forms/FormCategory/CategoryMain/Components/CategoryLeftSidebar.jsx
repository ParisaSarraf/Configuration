import { Button, Modal, Tooltip } from "antd";
import { DeleteOutlined, FormOutlined, EditOutlined } from "@ant-design/icons";
import { FolderOpen, Folder, Plus } from "lucide-react";
import FormCategoryModal from "../../FormCategoryModal";
import { useDeleteFormCategory } from "../../../../../QueryServises/formsQuery";
import FormDefinitionModal from "../../../FormDefinition/Components/FormDefinitionModal";

// پالت رنگی برای متمایز شدن دسته‌بندی‌ها
const PALETTE = [
 {
 idle: "bg-blue-50 text-blue-600",
 active: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
 row: "bg-blue-50/80 ring-1 ring-blue-200",
 text: "text-blue-800",
 badge: "bg-blue-600 text-white",
 },
 {
 idle: "bg-blue-50 text-blue-600",
 active: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
 row: "bg-blue-50/80 ring-1 ring-blue-200",
 text: "text-blue-800",
 badge: "bg-blue-600 text-white",
 },
 {
 idle: "bg-emerald-50 text-emerald-600",
 active: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
 row: "bg-emerald-50/80 ring-1 ring-emerald-200",
 text: "text-emerald-800",
 badge: "bg-emerald-600 text-white",
 },
 {
 idle: "bg-amber-50 text-amber-600",
 active: "bg-gradient-to-br from-amber-500 to-amber-500 text-white",
 row: "bg-amber-50/80 ring-1 ring-amber-200",
 text: "text-amber-800",
 badge: "bg-amber-500 text-white",
 },
 {
 idle: "bg-red-50 text-red-600",
 active: "bg-gradient-to-br from-red-500 to-red-500 text-white",
 row: "bg-red-50/80 ring-1 ring-red-200",
 text: "text-red-800",
 badge: "bg-red-500 text-white",
 },
 {
 idle: "bg-blue-50 text-blue-600",
 active: "bg-gradient-to-br from-blue-500 to-blue-500 text-white",
 row: "bg-blue-50/80 ring-1 ring-blue-200",
 text: "text-blue-800",
 badge: "bg-blue-500 text-white",
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
 <div className="mt-2 text-xs text-slate-500">
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
 className="!mb-3 !flex !h-9 !w-full !items-center !justify-center !gap-1 !rounded-xl !border-none !bg-gradient-to-l !from-blue-600 !to-blue-600 !text-xs !font-bold shadow-sm hover:!opacity-90"
 >
 دسته‌بندی جدید
 </Button>

 <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pl-0.5">
 {categories.length === 0 && (
 <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-center text-xs text-blue-500">
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
 isActive ? color.row : "hover:bg-slate-50"
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
 {isActive ? (
 <FolderOpen size={14} />
 ) : (
 <Folder size={14} />
 )}
 </span>

 <span
 className={`min-w-0 flex-1 truncate text-xs ${
 isActive
 ? `font-bold ${color.text}`
 : "font-medium text-slate-700"
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
 className="!h-6 !w-6 !rounded-lg !p-0 !text-slate-400 hover:!bg-emerald-100 hover:!text-emerald-600"
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
 className="!h-6 !w-6 !rounded-lg !p-0 !text-slate-400 hover:!bg-blue-100 hover:!text-blue-600"
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
 className="!h-6 !w-6 !rounded-lg !p-0 hover:!bg-red-100"
 onClick={(e) => {
 e.stopPropagation();
 handleDelete(item);
 }}
 />
 </Tooltip>
 </div>

 <span
 className={`mx-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold ${
 isActive ? color.badge : "bg-slate-100 text-slate-500"
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
