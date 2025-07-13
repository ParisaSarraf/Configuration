import {Button, Card, Tooltip} from "antd"
import {useProductContext} from "../../Services/Context/ProductContext";
import ListOfProductsAttachedToSerialsTransfer from "./components/ListOfProductsAttachedToSerialsTransfer";
import useModal from "../../hooks/useModal.js";
import SerialList from "./components/SerialList/SerialList.jsx";
import {PlusOutlined} from "@ant-design/icons";
import {useState} from "react";

const ProductTracking = () => {
    const {isOpen, modalMode, modalData, setModal, closeModal, modalType} = useModal();
    const {currentProduct} = useProductContext();
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedParentId, setSelectedParentId] = useState(null);


    const handlAddProductSerial = () => {
        setModal({mode: 'add', data: null, type: 'ProductSerial'})
    }

    return (
        <Card
            title={` پنجره ردیابی ${currentProduct?.name || ''}`}
            extra=
                {
                    <Tooltip title='افزودن سریال' className='mb-2'>
                        <Button icon={<PlusOutlined/>} type='primary' onClick={handlAddProductSerial}/>
                    </Tooltip>
                }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                <div className="col-span-1">
                    <SerialList
                        key={currentProduct?.id}
                        isOpen={isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        modalType={modalType}
                        selectedRowId={selectedRowId}
                        setSelectedRowId={setSelectedRowId}
                        setSelectedParentId={setSelectedParentId}
                        currentProduct={currentProduct}
                        closeModal={closeModal}
                        setModal={setModal}
                        handlAddProductSerial={handlAddProductSerial}
                    />
                </div>
                <div className="col-span-2">
                    <ListOfProductsAttachedToSerialsTransfer
                        selectedRowId={selectedRowId}
                        currentProduct={currentProduct}
                        selectedParentId={selectedParentId}
                    />
                </div>
            </div>
        </Card>
    )
}

export default ProductTracking