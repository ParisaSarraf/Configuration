import {message, Modal, Table, Tag, Tooltip} from "antd";
import {MeetingRelatedToActivitiesCols} from "./components/MeetingRelatedToActivitiesCols";

const MinutesRelatedToActivities = ({setModal, meetingData, deleteMeeting, refetch}) => {
    const handleEdit = (record) => {
        setModal({mode: 'edit', data: record, type: 'AddOrEditModal'});
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
        setModal({mode: 'detail', data: record, type: 'meetingsMinutes'});
    }

    const expandedRowRender = (record) => {
        const activityColumns = [
            {
                title: 'ردیف',
                key: 'index',
                render: (_, __, index) => index + 1,
            },
            {
                title: 'کد فعالیت',
                dataIndex: 'full_code',
                key: 'full_code',
                render: (full_code) => (
                    <Tag
                        color="blue"
                        style={{
                            maxWidth: 200,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {full_code || 'بدون کد'}
                    </Tag>
                )
            },
            // {
            //     title: 'نوع',
            //     dataIndex: 'type',
            //     key: 'type',
            //     render: (type) => (
            //         <Tag color="blue">{type || 'نامشخص'}</Tag>
            //     )
            // },
            // {
            //     title: 'کد',
            //     dataIndex: 'code',
            //     key: 'code',
            //     render: (code) => code || 'نامشخص'
            // },
            {
                title: 'توضیحات',
                dataIndex: 'description',
                key: 'description',
                render: (description) => {

                    return (
                        <Tooltip title={description}>
                            <Tag
                                color="blue"
                                style={{
                                    maxWidth: 200,
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {description}
                            </Tag>
                        </Tooltip>
                    );
                }
            },
            {
                title: 'تاریخ شروع',
                dataIndex: 'from_date',
                key: 'from_date'
            },
            {
                title: 'تاریخ پایان',
                dataIndex: 'to_date',
                key: 'to_date'
            },
            {
                title: 'وضعیت',
                dataIndex: 'state',
                key: 'state',
                render: (state) => {
                    const statusMap = {
                        10: {color: 'green', text: 'ثبت شده'},
                        20: {color: 'orange', text: 'در مرحله متولی'},
                        30: {color: 'blue', text: 'در مرحله طرح و برنامه'},
                    };
                    const status = statusMap[state] || {color: 'gray', text: 'نامشخص'};
                    return <Tag color={status.color}>{status.text}</Tag>;
                }
            }
        ];

        return (
            <Table
                columns={activityColumns}
                dataSource={record.meeting_activities}
                rowKey="id"
                pagination={false}
            />
        );
    }

    return (
        <Table
            size="small"
            columns={MeetingRelatedToActivitiesCols({handleEdit, handleDelete, handleShowDetail})}
            dataSource={meetingData}
            rowKey="id"
            expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.meeting_activities && record.meeting_activities.length > 0
            }}
        />
    );
};

export default MinutesRelatedToActivities;