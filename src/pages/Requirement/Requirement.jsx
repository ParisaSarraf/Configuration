import { Card } from "antd"
import { useProductContext } from "../../Services/Context/ProductContext";
import RequirementModal from "./components/RequirementModal";
import useModal from "../../hooks/useModal";
import { useRequirementList } from "../../QueryServises/requirementQuery";

const Requirement = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { refetch } = useRequirementList()
    const { currentProduct } = useProductContext();


    return (
        <Card
            title={` الزامات ${currentProduct?.name || ''}`}
            extra={
                <RequirementModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                />
            }
        >
        </Card>
    )
}

export default Requirement
