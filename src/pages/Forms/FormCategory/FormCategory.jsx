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

 const totalForms = category.reduce(
 (sum, item) => sum + (Number(item?.number_of_forms) || 0),
 0,
 );

 return (
 <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-blue-50 px-6 pt-6 ">
 <CategoryHeader
 refetch={refetch}
 totalCategories={category.length}
 totalForms={totalForms}
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
