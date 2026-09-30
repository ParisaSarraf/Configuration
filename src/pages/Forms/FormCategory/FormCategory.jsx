import useModal from "../../../hooks/useModal";
import { useFormCategoryList } from "../../../QueryServises/formsQuery";
import Header from "@/components/Layouts/Header.jsx";
import CategoryHeader from "./CategoryHeader";
import CategoryMain from "./CategoryMain/CategoryMain";

const FormCategory = () => {
  const { setModal, modalMode, modalData, modalType, closeModal, isOpen } =
    useModal();

  const { data, refetch } = useFormCategoryList();

  const category = data ?? [];

  const totalForms = category.reduce(
    (sum, item) => sum + (Number(item?.number_of_forms) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <CategoryHeader
          refetch={refetch}
          totalCategories={category.length}
          totalForms={totalForms}
        />

        <CategoryMain
          category={category}
          refetch={refetch}
          setModal={setModal}
          modalMode={modalMode}
          modalData={modalData}
          modalType={modalType}
          closeModal={closeModal}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default FormCategory;
