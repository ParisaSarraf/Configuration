import useModal from 'antd/es/modal/useModal';
import { useProductContext } from '../../../../Services/Context/ProductContext';
import SerialListTable from './SerialListTable'
import SerialListModal from './SerialListModal';

const SerialList = () => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    const { currentProduct } = useProductContext();
    return (
        <>
            <SerialListTable
                currentProduct={currentProduct}
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                setModal={setModal}
            // refetch={refetch}
            />
            {modalType === 'ProductSerial' && (
                <SerialListModal
                    currentProduct={currentProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                />
            )}
        </>
    )
}

export default SerialList
