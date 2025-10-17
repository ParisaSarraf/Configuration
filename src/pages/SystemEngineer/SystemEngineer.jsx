import {PlusOutlined} from "@ant-design/icons";
import {Button, Card, message, Modal, Spin, Table} from "antd";
import {useDeleteSystemEngineer, useSystemEngineeringList} from "@/QueryServises/SystemEngineering/index.js";
import useModal from "@/hooks/useModal.js";
import SystemEngineerModal from "@/pages/SystemEngineer/components/SystemEngineerModal.jsx";
import SystemEngineerCols from "./components/SystemEngineerCols";

const SystemEngineer = () => {
    const {data: systemData, refetch, isFetching} = useSystemEngineeringList()
    const {mutateAsync: deleteSystem} = useDeleteSystemEngineer()
    const {setModal, modalMode, modalData, isOpen, closeModal} = useModal()
    const handleEdit = (record) => {
        console.log(record)
        setModal({mode: 'edit', data: record})
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'آیا مطمئن هستید؟',
            content: 'این عمل قابل بازگشت نیست.',
            okText: 'حذف',
            okType: 'danger',
            cancelText: 'لغو',
            onOk: async () => {
                try {
                    await deleteSystem(id)
                    message.success(' با موفقیت حذف شد');
                    refetch();
                } catch (error) {
                    console.error('error delete', error);
                    message.error('خطا در حذف ');
                }
            }
        });
    }
    return (
        <Spin spinning={isFetching && !systemData} tip={'درحال دریافت اطلاعات ...'}>
            <Card title={'مهندسی سیستم'}
                  extra={
                      <Button
                          className="modal-button" icon={<PlusOutlined/>} onClick={() => {
                          setModal({mode: 'add', data: null})
                      }}>
                          ثبت تعریف جدید
                      </Button>
                  }>
                <Table dataSource={systemData || []}
                       size={'small'}
                       bordered
                       columns={SystemEngineerCols({handleDelete, handleEdit})}
                />

                <SystemEngineerModal
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    refetch={refetch}
                />
            </Card>

        </Spin>
    )
}

export default SystemEngineer