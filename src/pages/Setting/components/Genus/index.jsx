import { Card, Table, message, Spin } from 'antd';
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
        data,
        isFetching,
        isError,
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
        if (!record?.id) {
            message.error("شناسه جنس معتبر نیست");
            return;
        }
        setModal({ mode: 'edit', data: record });
    };

    const genusData = data?.filter(item => item?.type === 'genus') || [];


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
                <Table
                    columns={GenusCol({ handleDelete, handleEdit })}
                    dataSource={genusData}
                    rowKey="id"
                    loading={isFetching && !!data} 
                    scroll={{ x: true }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                    }}
                    locale={{
                        emptyText: 'هیچ جنسی یافت نشد'
                    }}
                />
            </Card>
        </Spin>
    );
};

export default Genus;