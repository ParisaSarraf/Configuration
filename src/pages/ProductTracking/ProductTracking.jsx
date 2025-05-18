import { Card } from "antd"
import { useProductContext } from "../../Services/Context/ProductContext";
import SerialListTable from "./components/SerialList/SerialListTable.jsx";
import ListOfProductsAttachedToSerialsTransfer from "./components/ListOfProductsAttachedToSerialsTransfer";
import useModal from "../../hooks/useModal.js";
import SerialList from "./components/SerialList/SerialList.jsx";

const ProductTracking = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { currentProduct } = useProductContext();

    return (
        <Card
            title={` پنجره ردیابی ${currentProduct?.name || ''}`}
        >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <SerialList />
                </div>
                <div className="col-span-1">
                    <ListOfProductsAttachedToSerialsTransfer />
                </div>
            </div>


        </Card >
    )
}

export default ProductTracking
