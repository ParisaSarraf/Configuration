import { Card, Table, message } from 'antd';
import React from 'react';
import useModal from '../../../../hooks/useModal';
import { casingCol } from './components/CasingCol';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import CasingModal from './components/CasingModal';

const Casing = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data = [],
        isFetching,
        refetch
    } = useCoreSettingsList();
    const { mutate: deleteCasing, isPending: isDeleting } = useDeleteCoreSetting();

    const handleDelete = (record) => {
        deleteCasing(record, {
            onSuccess: () => {
                message.success("پوشش با موفقیت حذف شد");
                refetch();
            },
            onError: (error) => {
                if (error.response?.status === 404) {
                    message.error("پوشش مورد نظر یافت نشد");
                } else {
                    message.error(error.response?.data?.detail || "خطا در حذف پوشش");
                }
                console.error("Delete error:", error);
            }
        });
    };

    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record });
    };

    const casingData = data?.filter(item => item?.type === 'casing') || [];

    return (
        <Card
            title="مدیریت پوشش"
            extra={
                <CasingModal
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
                columns={casingCol({ handleDelete, handleEdit })}
                dataSource={casingData}
                rowKey="id"
                loading={isFetching}
                scroll={{ x: true }}
                pagination={{
                    pageSize: 10,
                }}
                locale={{
                    emptyText: 'هیچ پوششی یافت نشد'
                }}
            />
        </Card>
    );
};

export default Casing;