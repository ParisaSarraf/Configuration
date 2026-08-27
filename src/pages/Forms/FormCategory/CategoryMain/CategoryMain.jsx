import { useState } from "react";
import { useFormCategoryById } from "../../../../QueryServises/formsQuery";
import CategoryLeftSidebar from "./Components/CategoryLeftSidebar";
import CategoryRightSidebar from "./Components/CategoryRightSidebar";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import FormDefinitionCols from "./Components/FormDefinitionCols";
import FormDefinitionCategoryDetail from "../../FormDefinition/Components/FormDefinitionCategoryDetail";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const categories = category ?? [];
  const { data: categoryByIdData } = useFormCategoryById(categoryId);
  const forms = categoryByIdData?.[0]?.forms || [];

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

  const handleCreateFormDefinitionFeild = (record) => {
    navigate('/')
  };

  const columns = FormDefinitionCols({
    handleEdit,
    handleView,
    refetch,
    handleCreateFormDefinitionFeild,
  });

  return (
    <div className="px-6 pb-6" dir="rtl">
      <div
        className="
          mx-auto
          grid
          h-[calc(100vh-180px)]
          max-w-[1600px]
          min-h-0
          grid-cols-[260px_minmax(0,1fr)_300px]
          gap-5
        "
      >
        {/* Left Sidebar */}
        <aside className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
        </aside>

        {/* Main */}
        <main className="min-h-0 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {forms.length > 0 ? (
            <TableAntd
              columns={columns}
              rowKey="id"
              pagination={false}
              loading={false}
              scroll={{ x: "max-content" }}
              tableLayout="auto"
              dataSource={forms}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
              <div className="text-lg font-semibold">
                هیچ فرمی در این دسته‌بندی وجود ندارد.
              </div>
              <div className="text-sm">
                برای ایجاد فرم جدید، از بخش سمت راست اقدام کنید.
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CategoryRightSidebar
            category={categories}
            refetch={refetch}
            setModal={setModal}
            modalMode={modalMode}
            modalData={modalData}
            modalType={modalType}
            closeModal={closeModal}
            isOpen={isOpen}
          />
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
