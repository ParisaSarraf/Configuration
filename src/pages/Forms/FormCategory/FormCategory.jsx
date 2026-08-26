import useModal from "../../../hooks/useModal";
import { useFormCategoryList } from "../../../QueryServises/formsQuery";
import CategoryHeader from "./CategoryHeader";
import CategoryMain from "./CategoryMain/CategoryMain";

const FormCategory = () => {
  const {
    setModal,
    modalMode,
    modalData,
    modalType,
    closeModal,
    isOpen,
  } = useModal();

const { data, refetch } = useFormCategoryList();

const category = data ?? [];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <CategoryHeader
        refetch={refetch}
        setModal={setModal}
        modalMode={modalMode}
        modalData={modalData}
        modalType={modalType}
        closeModal={closeModal}
        isOpen={isOpen}
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
  );
};

export default FormCategory;