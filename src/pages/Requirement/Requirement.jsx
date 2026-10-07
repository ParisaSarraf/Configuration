import { Card } from "antd";
import { useProductContext } from "../../Services/Context/ProductContext";
import RequirementModal from "./components/RequirementModal";
import useModal from "../../hooks/useModal";
import { useRequirementList } from "../../QueryServises/requirementQuery";
import RequirementTree from "./components/RequirementTree";
import RequirementTable from "./components/RequirementTable";

const Requirement = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { refetch } = useRequirementList();
    const { currentProduct } = useProductContext();

    return (
        <Card
            title={` الزامات ${currentProduct?.name || ""}`}
            extra={
                <RequirementModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                />
            }
        >
            <div className="w-full flex flex-row gap-2">
                <div className="w-1/2">
                    <RequirementTree setModal={setModal} />
                </div>
                <div className="w-3/4">
                    <RequirementTable setModal={setModal} />
                </div>
            </div>
        </Card>
    );
};

export default Requirement;
