import useModal from "../../../hooks/useModal";
import { useFormCategoryList } from "../../../QueryServises/formsQuery";
import CategoryHeader from "./CategoryHeader";
import CategoryMain from "./CategoryMain/CategoryMain";

const FormCategory = () => {
  const { setModal, modalMode, modalData, modalType, closeModal, isOpen } =
    useModal();
  const { data: category, refetch } = useFormCategoryList();
  return (
    <div>
      <CategoryHeader
        refetch={refetch}
        setModal={setModal}
        modalMode={modalMode}
        modalData={modalData}
        modalType={modalType}
        closeModal={closeModal}
        isOpen={isOpen}
      />
      <CategoryMain />
    </div>
  );
};

export default FormCategory;
