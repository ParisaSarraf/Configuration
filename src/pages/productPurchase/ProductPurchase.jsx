import { Button, Card } from "antd"
import { useProductContext } from "../../Services/Context/ProductContext";
import RequestOfWarehouse from "./components/RequestOfWarehouse/RequestOfWarehouse";
import PurchaseProductTable from "./components/PurchaseProductTable/PurchaseProductTable";
import PurchaseModal from "./components/PurchaseModal/PurchaseModal";
import useModal from "../../hooks/useModal";
import { PlusOutlined } from "@ant-design/icons";

const ProductPurchase = () => {
    const { currentProduct } = useProductContext();
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();

    return (
        <Card
            title={`درخواست خرید ${currentProduct?.name}`}
            extra={
                <Button
                    icon={<PlusOutlined />}
                    className="modal-button"
                    onClick={() => setModal({ mode: 'add', data: null, type: 'purchaseModal' })} />
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="col-span-1">
                    <PurchaseProductTable currentProduct={currentProduct} />
                </div>
                <div className="col-span-1">
                    <RequestOfWarehouse currentProduct={currentProduct} />
                </div>
                <PurchaseModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    modalType={modalType}
                    closeModal={closeModal}
                    setModal={setModal}
                // refetch={refetch}
                />
            </div>

        </Card>
    )
}

export default ProductPurchase
