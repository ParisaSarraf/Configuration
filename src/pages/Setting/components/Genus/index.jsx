import { Card, Table, message } from 'antd';
import React from 'react';
import useModal from '../../../../hooks/useModal';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import GenusModal from './components/GenusModal';
import { GenusCol } from './components/GenusCol';

const Genus = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data = [],
        isFetching,
        refetch
    } = useCoreSettingsList();

    const { mutate: deleteGenus, isPending: isDeleting } = useDeleteCoreSetting();

    const handleDelete = (record) => {
        deleteGenus(record, {
            onSuccess: () => {
                message.success("جنس با موفقیت حذف شد");
                refetch();
            },
            onError: (error) => {
                if (error.response?.status === 404) {
                    message.error("جنس مورد نظر یافت نشد");
                } else {
                    message.error(error.response?.data?.detail || "خطا در حذف جنس");
                }
                console.error("Delete error:", error);
            }
        });
    };

    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record });
    };

    // const genusData = data.filter(item => item.type === 'genus');

    return (
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
            loading={isFetching || isDeleting}
        >
            <Table
                columns={GenusCol({ handleDelete, handleEdit })}
                dataSource={data}
                rowKey="id"
                loading={isFetching}
                scroll={{ x: true }}
                pagination={{
                    pageSize: 10,
                }}
                locale={{
                    emptyText: 'هیچ جنسی یافت نشد'
                }}
            />
        </Card>
    );
};

export default Genus;