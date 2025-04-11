import { Card, Spin, Table } from 'antd';
import useModal from '../../../../hooks/useModal';
import { useDeleteLifeCycle, useLifeCycleList } from '../../../../QueryServises/lifeCycleQuery';
import LifeCycleModal from './components/LifeCycleModal';
import { LifeCycleCol } from './components/LifeCycleCol';

const LifeCycle = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data: lifeCycleList,
        isFetching,
        refetch
    } = useLifeCycleList();

    const { isPending: isDeleting, mutateAsync: deleteLifeCycle } = useDeleteLifeCycle();


    const handleDelete = (record) => {
        deleteLifeCycle(record, {
            onSuccess: () => {
                message.success("چرخه حیات محصول با موفقیت حذف شد");
                refetch();
            },
            onError: (error) => {
                if (error.response?.status === 404) {
                    message.error("چرخه حیات محصول مورد نظر یافت نشد");
                } else {
                    message.error(error.response?.data?.detail || "خطا در حذف چرخه حیات محصول");
                }
                console.error("Delete error:", error);
            }
        });
    };

    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record });
    };



    return (
        <Spin spinning={isFetching && !lifeCycleList} tip="در حال دریافت اطلاعات...">
            <Card
                title="مدیریت چرخه زندگی"
                extra={
                    <LifeCycleModal
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
                    columns={LifeCycleCol({ handleDelete, handleEdit })}
                    dataSource={lifeCycleList}
                    rowKey="id"
                    loading={isFetching}
                    scroll={{ x: true }}
                    pagination={{
                        pageSize: 10,
                    }}
                    locale={{
                        emptyText: 'هیچ چرخه حیات محصولی یافت نشد'
                    }}
                />
            </Card>
        </Spin>
    );
};

export default LifeCycle;