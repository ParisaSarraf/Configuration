import SerialListTable from './SerialListTable'
import SerialListModal from './SerialListModal';
import { useProductSerialById } from '../../../../QueryServises/productSerialQuery';

const SerialList = ({ isOpen, modalMode, modalData, modalType, closeModal, setModal, currentProduct, selectedRowId, setSelectedRowId, setSelectedParentId }) => {
    const { refetch } = useProductSerialById(currentProduct?.id)

    return (
        <>
            <SerialListTable
                currentProduct={currentProduct}
                isOpen={isOpen}
                setSelectedRowId={setSelectedRowId}
                selectedRowId={selectedRowId}
                modalMode={modalMode}
                setSelectedParentId={setSelectedParentId}
                modalData={modalData}
                closeModal={closeModal}
                setModal={setModal}
            />
            {modalType === 'ProductSerial' && (
                <SerialListModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                />
            )}
        </>
    )
}

export default SerialList
