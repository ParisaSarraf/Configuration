import { Card, Table, message } from 'antd';
import React from 'react';
import useModal from '../../../../hooks/useModal';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import { PersonalityCol } from './components/PersonalityCol';
import PersonalityModal from './components/PersonalityModal';

const Personality = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data = [],
        isFetching,
        refetch
    } = useCoreSettingsList();

    const { mutate: deletePersonality, isPending: isDeleting } = useDeleteCoreSetting();

    const handleDelete = (record) => {
        deletePersonality(record, {
            onSuccess: () => {
                message.success("شخصیت با موفقیت حذف شد");
                refetch();
            },
            onError: (error) => {
                if (error.response?.status === 404) {
                    message.error("شخصیت مورد نظر یافت نشد");
                } else {
                    message.error(error.response?.data?.detail || "خطا در حذف شخصیت");
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
            title="مدیریت شخصیت"
            extra={
                <PersonalityModal
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
                columns={PersonalityCol({ handleDelete, handleEdit })}
                dataSource={data}
                rowKey="id"
                loading={isFetching}
                scroll={{ x: true }}
                pagination={{
                    pageSize: 10,
                }}
                locale={{
                    emptyText: 'هیچ شخصیت یافت نشد'
                }}
            />
        </Card>
    );
};

export default Personality;