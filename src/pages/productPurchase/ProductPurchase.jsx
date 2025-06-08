import { Button, Card, Tabs } from "antd"
import { useProductContext } from "../../Services/Context/ProductContext";
import RequestOfWarehouse from "./components/RequestOfWarehouse/RequestOfWarehouse";
import PurchaseProductTable from "./components/PurchaseProductTable/PurchaseProductTable";
import PurchaseModal from "./components/PurchaseModal/PurchaseModal";
import useModal from "../../hooks/useModal";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useUnConfirmProductPurchaseById } from "../../QueryServises/productPurchase";
import ListOfRequestsMade from "./components/ListOfRequestsMade/ListOfRequestsMade";

const ProductPurchase = () => {
    const { currentProduct } = useProductContext();
    const { refetch } = useUnConfirmProductPurchaseById(currentProduct?.id)
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null)

    const items = [
        {
            key: '1',
            label: 'لیست درخواست خرید',
            children:
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="col-span-1">
                            <PurchaseProductTable currentProduct={currentProduct} setSelectedPurchaseId={setSelectedPurchaseId} setModal={setModal} />
                        </div>
                        <div className="col-span-1">
                            <RequestOfWarehouse selectedPurchaseId={selectedPurchaseId} />
                        </div>
                    </div>
                </>
        },
        {
            key: '2',
            label: 'درخواست های انجام شده',
            children:
                <ListOfRequestsMade currentProduct={currentProduct} />
            ,

        }
    ];

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
            <div>
                <Tabs
                    items={items}
                    type="card"
                />

                <PurchaseModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    modalType={modalType}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                />
            </div>

        </Card>
    )
}

export default ProductPurchase
