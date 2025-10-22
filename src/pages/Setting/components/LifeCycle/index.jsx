import { Card, message, Spin, Table } from 'antd';
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
                message.success("چرخه عمر محصول با موفقیت حذف شد");
                refetch();
            },
            onError: (error) => {
                if (error.response?.status === 404) {
                    message.error("چرخه عمر محصول مورد نظر یافت نشد");
                } else {
                    message.error(error.response?.data?.detail || "خطا در حذف چرخه عمر محصول");
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
                title="مدیریت چرخه عمر"
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
                    size={'small'}
                    loading={isFetching}
                    scroll={{ x: true }}
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45,100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                    locale={{
                        emptyText: 'هیچ چرخه عمر محصولی یافت نشد'
                    }}
                />
            </Card>
        </Spin>
    );
};

export default LifeCycle;