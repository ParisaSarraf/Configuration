import { MeetingRelatedToActivities, MeetingsCol } from "@/pages/Meetings/components/MeetingsCol.jsx";
import { message, Modal, Table } from "antd";

const IndependentMinutes = ({ setModal, meetingData, deleteMeeting, refetch }) => {
    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record });
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'حذف صورتجلسه',
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
        <Table
            size="small"
            columns={MeetingsCol({ handleEdit, handleDelete })}
            dataSource={meetingData}
            rowKey="id"
        />
    );
};

export default IndependentMinutes;