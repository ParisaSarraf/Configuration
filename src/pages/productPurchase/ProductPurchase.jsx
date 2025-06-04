import { Button, Card } from "antd"
import { useProductContext } from "../../Services/Context/ProductContext";
import RequestOfWarehouse from "./components/RequestOfWarehouse/RequestOfWarehouse";
import PurchaseProductTable from "./components/PurchaseProductTable/PurchaseProductTable";

const ProductPurchase = () => {
    const { currentProduct } = useProductContext();

    return (
        <Card
            title={`درخواست خرید و درخواست کالا از انبار محصول ${currentProduct?.name}`}
            extra={
                <Button onClick={() => setModal({ mode: 'add', data: null, type: 'purchaseModal' })} />
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
                    isOpen={modalType ? `purchaseModal` : isOpen}

                    
                />
            </div>

        </Card>
    )
}

export default ProductPurchase
