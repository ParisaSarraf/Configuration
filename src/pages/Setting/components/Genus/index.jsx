import { Card, Spin } from 'antd';
import useModal from '../../../../hooks/useModal';
import GenusModal from './components/GenusModal';
import { useDeleteGenusProduct, useGenusProductList } from '@/QueryServises/genusQuery/index.js';
import GenusTree from './components/GenusTree';

const Genus = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data,
        isFetching,
        refetch
    } = useGenusProductList();

    const { isPending: isDeleting } = useDeleteGenusProduct();


    return (
        <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
            <Card
                title="مدیریت جنس"
                extra={
                    <GenusModal
                        isOpen={isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        closeModal={closeModal}
                        setModal={setModal}
                        refetch={refetch}
                    />
                }
                loading={isDeleting}
            >
                <GenusTree setModal={setModal} />
            </Card>
        </Spin>
    );
};

export default Genus;