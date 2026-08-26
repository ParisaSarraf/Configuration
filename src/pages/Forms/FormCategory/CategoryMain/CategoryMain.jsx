import CategoryLeftSidebar from "./Components/CategoryLeftSidebar";
import CategoryRightSidebar from "./Components/CategoryRightSidebar";

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
  return (
    <div className="px-4 pb-4">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[320px_minmax(0,1fr)_300px] gap-5">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CategoryLeftSidebar
            category={category}
            refetch={refetch}
            setModal={setModal}
            modalMode={modalMode}
            modalData={modalData}
            modalType={modalType}
            closeModal={closeModal}
            isOpen={isOpen}
          />
        </aside>

        <main className="min-h-[calc(100vh-180px)] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                مدیریت دسته‌بندی‌ها
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                دسته‌بندی‌های فرم‌ها را مدیریت کنید.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
              {category?.length} دسته‌بندی
            </div>
          </div>

          {category.length === 0 ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">

                <h2 className="text-lg font-semibold text-gray-700">
                  هنوز دسته‌بندی‌ای وجود ندارد
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  برای شروع یک دسته‌بندی جدید ایجاد کنید.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
            </div>
          )}
        </main>

        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CategoryRightSidebar
            category={category}
            refetch={refetch}
            setModal={setModal}
            modalMode={modalMode}
            modalData={modalData}
            modalType={modalType}
            closeModal={closeModal}
            isOpen={isOpen}
          />
        </aside>
      </div>
    </div>
  );
};

export default CategoryMain;
