import { useState } from "react";
import { useFormCategoryById } from "../../../../QueryServises/formsQuery";
import CategoryLeftSidebar from "./Components/CategoryLeftSidebar";
import CategoryRightSidebar from "./Components/CategoryRightSidebar";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import FormDefinitionCols from "./Components/FormDefinitionCols";
import FormDefinitionCategoryDetail from "../../FormDefinition/Components/FormDefinitionCategoryDetail";
import { useLocation, useNavigate } from "react-router-dom";
import { openFormStudio } from "../../FormBuilderStudio/formStudioNavigation";
import { Eye, FileSpreadsheet, FolderTree, Inbox } from "lucide-react";

const CategoryMain = ({
  category = [],
  refetch,
  setModal,
  modalMode,
  modalData,
  modalType,
  closeModal,
  isOpen,
}) => {
  const [categoryId, setCategoryId] = useState("all");
  const [FormId, setFormId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = category ?? [];
  const { data: categoryByIdData } = useFormCategoryById(categoryId);
  const forms = categoryByIdData?.[0]?.forms || [];
  const activeCategoryName =
    categoryByIdData?.[0]?.name ||
    categories.find((item) => String(item.id) === String(categoryId))?.name ||
    "همه فرم‌ها";

  const handleView = (record) => {
    setModal({
      mode: "view",
      data: record.id,
      type: "viewCategoryDefinitionDetail",
    });
  };
  const handleEdit = (record) => {
    setModal({
      mode: "edit",
      data: record,
      type: "createFormDefinitionCategory",
    });
  };

  const handleCreateFormDefinitionField = (formDefinitionId) => {
    openFormStudio(navigate, formDefinitionId, location.pathname);
  };

  const handlePreview = (record) => {
    setFormId(record.id);
  };

  const columns = FormDefinitionCols({
    handleEdit,
    handleView,
    refetch,
    handleCreateFormDefinitionField,
    handlePreview,
  });

  const rowSelection = {
    type: "radio",
    onChange: (selectedRowKeys) => {
      setFormId(selectedRowKeys[0] || null);
    },
  };

  return (
    <div className="pb-6">
      <div
        className="
          mx-auto
          grid
          h-[calc(100vh-210px)]
          max-w-[1600px]
          min-h-0
          grid-cols-[260px_minmax(0,1fr)_550px]
          gap-4
        "
      >
        {/* Left Sidebar — دسته‌بندی‌ها */}
        <aside className="min-h-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-md shadow-sky-100/60">
          <div className="flex items-center gap-2 border-b border-sky-100 bg-gradient-to-l from-sky-50 to-indigo-50 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <FolderTree size={16} />
            </span>
            <span className="text-xs font-bold text-sky-900">
              دسته‌بندی فرم‌ها
            </span>
          </div>

          <div className="h-[calc(100%-53px)] min-h-0 p-3">
            <CategoryLeftSidebar
              setCategoryId={setCategoryId}
              categoryId={categoryId}
              category={categories}
              refetch={refetch}
              setModal={setModal}
              modalMode={modalMode}
              modalData={modalData}
              modalType={modalType}
              closeModal={closeModal}
              isOpen={isOpen}
            />
          </div>
        </aside>

        {/* Main — لیست فرم‌ها */}
        <main className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-md shadow-indigo-100/60">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-indigo-100 bg-gradient-to-l from-indigo-50 via-violet-50 to-white px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <FileSpreadsheet size={16} />
              </span>
              <div>
                <h2 className="m-0 text-sm font-bold text-indigo-900">
                  {activeCategoryName}
                </h2>
                <p className="m-0 text-[11px] text-indigo-400">
                  لیست فرم‌های این دسته‌بندی
                </p>
              </div>
            </div>

            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {forms.length} فرم
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {forms.length > 0 ? (
              <TableAntd
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={false}
                scroll={{ x: "max-content" }}
                tableLayout="auto"
                dataSource={forms}
                rowSelection={rowSelection}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-500 shadow-sm">
                  <Inbox size={26} />
                </span>
                <div className="text-base font-bold text-slate-700">
                  هیچ فرمی در این دسته‌بندی وجود ندارد.
                </div>
                <div className="text-xs text-slate-500">
                  برای ایجاد فرم جدید، از آیکن «افزودن فرم» روی دسته‌بندی
                  اقدام کنید.
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar — پیش‌نمایش */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md shadow-emerald-100/60">
          <div className="flex shrink-0 items-center gap-2 border-b border-emerald-100 bg-gradient-to-l from-emerald-50 to-teal-50 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Eye size={16} />
            </span>
            <span className="text-xs font-bold text-emerald-900">
              پیش‌نمایش فرم
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <CategoryRightSidebar
              category={categories}
              refetch={refetch}
              setModal={setModal}
              modalMode={modalMode}
              FormId={FormId}
              modalData={modalData}
              modalType={modalType}
              closeModal={closeModal}
              isOpen={isOpen}
            />
          </div>
        </aside>

        <FormDefinitionCategoryDetail
          modalData={modalData}
          closeModal={closeModal}
          modalMode={modalMode}
          modalType={modalType}
          isOpen={modalType === "viewCategoryDefinitionDetail"}
        />
      </div>
    </div>
  );
};

export default CategoryMain;
