import {Button, Card, message, Modal, Table} from "antd";
import useModal from "@/hooks/useModal.js";
import {MeetingsCol} from "@/pages/Meetings/components/MeetingsCol.jsx";
import MeetingsModal from "@/pages/Meetings/components/MeetingsModal.jsx";
import {useDeleteMeeting, useGetProductMeetings} from "@/QueryServises/MeetingQuery/index.js";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";

const Meetings = () => {
    const {currentProduct} = useProductContext();
    const {data: meetingData = [], refetch} = useGetProductMeetings(currentProduct?.id);
    const {mutateAsync: deleteMeeting} = useDeleteMeeting()

    const {setModal, closeModal, isOpen, modalData, modalMode, modalType} = useModal();

    const handleEdit = (record) => {
        setModal({mode: 'edit', data: record});
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'حذف  صورتجلسه',
            content: 'آیا از حذف این صورتجلسه مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            okType: 'danger',
            onOk() {
                return new Promise((resolve, reject) => {
                    deleteMeeting(id, {
                        onSuccess: () => {
                            message.success("صورتجلسه با موفقیت حذف شد");
                            refetch();
                            resolve();
                        },
                        onError: () => {
                            message.error("حذف صورتجلسه با خطا مواجه شد");
                            reject();
                        },
                    });
                });
            },
            onCancel() {
                console.log('حذف لغو شد');
            },
        });
    };

    return (
        <Card title='صورت جلسات'
              extra={
                  <Button className={'modal-button'} onClick={() => setModal({mode: 'add', data: null})}>
                      افزودن صورتجلسه
                  </Button>
              }>
            <Table
                columns={MeetingsCol({handleEdit, handleDelete})}
                dataSource={meetingData}
                rowKey="id"
            />

            <MeetingsModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                modalType={modalType}
                refetch={refetch}
                currentProduct={currentProduct}
            />
        </Card>
    );
};

export default Meetings;