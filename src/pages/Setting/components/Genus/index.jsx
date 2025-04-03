import { Card, message, Spin, Tree, Modal } from 'antd';
import React from 'react';
import useModal from '../../../../hooks/useModal';
import GenusModal from './components/GenusModal';
import { useDeleteGenusProduct, useGenusProductList } from '../../../../QueryServises/genusQuery';
import GenusTree from './components/GenusTree';

const Genus = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data,
        isFetching,
        isError,
        refetch
    } = useGenusProductList();

    const { mutate: deleteGenus, isPending: isDeleting } = useDeleteGenusProduct();

    if (isError) {
        return (
            <Card title="مدیریت جنس">
                <div className="text-center py-8">
                    <p className="text-red-500">خطا در دریافت اطلاعات جنس</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        تلاش مجدد
                    </button>
                </div>
            </Card>
        );
    }

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