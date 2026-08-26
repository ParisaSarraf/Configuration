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
  const categories = category ?? [];

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
          {/* Your main content */}
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
      </div>
    </div>
  );
};

export default CategoryMain;
