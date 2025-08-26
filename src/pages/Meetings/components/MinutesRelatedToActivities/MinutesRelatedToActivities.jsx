import {Button, Flex, message, Modal, Table, Tag, Tooltip} from "antd";
import {MeetingRelatedToActivitiesCols} from "./components/MeetingRelatedToActivitiesCols";
import {EyeOutlined} from "@ant-design/icons";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

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
                        color="cyan"
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
            {
                title: 'متولی',
                key: 'trustee',
                render: (record) => {
                    return (
                        <Tag
                            color="purple"
                            style={{
                                maxWidth: 200,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {record?.trustee?.name} {record?.trustee?.last_name}
                            <br/>
                            {record.meeting_activities?.trustee_description && `(${record.trustee_description})`}
                        </Tag>
                    )
                },
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
                key: 'from_date',
                render:(record) => {
                    return (
                        <>{georgianDateToJalaliDate(record)}</>
                    )
                }
            },
            {
                title: 'تاریخ پایان',
                dataIndex: 'to_date',
                key: 'to_date',
                render:(record) => {
                    return (
                        <>{georgianDateToJalaliDate(record)}</>
                    )
                }
            },
            {
                title: 'وضعیت',
                dataIndex: 'state',
                key: 'state',
                render: (state) => {
                    const statusMap = {
                        10: {color: 'red', text: 'ثبت شده'},
                        20: {color: 'purple', text: 'در مرحله متولی'},
                        30: {color: 'blue', text: 'در مرحله طرح و برنامه'},
                    };
                    const status = statusMap[state] || {color: 'gray', text: 'نامشخص'};
                    return <Tag color={status.color}>{status.text}</Tag>;
                }
            },
            {
                title: 'عملیات',
                key: 'actions',
                render: (_, record) => (
                    <Flex gap={4}>
                        <Tooltip title="جزئیات">
                            <Button
                                icon={<EyeOutlined/>}
                                className="text-sky-500 border-sky-500"
                                onClick={() => handleShowDetail(record)}
                                title='نمایش جزئیات '
                                size="small"
                            />
                        </Tooltip>

                    </Flex>
                ),
            },
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