import { MeetingRelatedToActivities, MeetingsCol } from "@/pages/Meetings/components/MeetingsCol.jsx";
import { message, Modal, Table, Tag } from "antd";

const MinutesRelatedToActivities = ({ setModal, meetingData, deleteMeeting, refetch }) => {
    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record, type: 'AddOrEditModal' });
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


    const handleShowDetail = (record) => {
        setModal({ mode: 'detail', data: record, type: 'detailModal' });
    };

    const expandedRowRender = (record) => {
        return (
            <Table
                size="small"
                columns={MeetingRelatedToActivities({ handleEdit, handleDelete })}
                dataSource={record.meeting_activities || []}
                rowKey="id"
                pagination={false}
            />
        );
    };

    return (
        <Table
            size="small"
            columns={MeetingsCol({ handleEdit, handleDelete, handleShowDetail })}
            dataSource={meetingData}
            rowKey="id"
            expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.meeting_activities?.length > 0
            }}
        />
    );
};

export default MinutesRelatedToActivities;