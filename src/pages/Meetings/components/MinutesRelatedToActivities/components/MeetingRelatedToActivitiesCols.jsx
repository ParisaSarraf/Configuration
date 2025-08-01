import {Button, Flex, Tooltip, Tag, Space, Badge} from "antd";
import {EyeOutlined} from "@ant-design/icons";
import {BASEURL} from "@/Services/axiosInstance.js";


export const MeetingRelatedToActivitiesCols = ({handleShowDetail}) => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'کد صورتجلسه',
            key: 'full_code',
            render: (_, record) => {
                // const code = record.meeting_activities?.[0]?.full_code || 'بدون کد';

                // const prefix = record.type === 'internal' ? 'MOU-I' : 'MOU-O';
                // const productCode = record.product?.code;
                return (
                    <Tag
                        color="blue"
                        style={{
                            maxWidth: 200,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {record?.full_code}
                    </Tag>
                );
            }
        },
        // {
        //     title: 'نوع فعالیت',
        //     key: 'activityType',
        //     render: (record) => record.type || 'نامشخص',
        // },
        {
            title: 'شرح صورتجلسه',
            key: 'title',
            render: (record) => {
                const description = record?.title || 'بدون توضیح';
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
            },
        },
        {
            title: 'متولی',
            key: 'trustee',
            render: (record) => {
                const trustee = record.meeting_activities?.[0]?.trustee || 'بدون توضیح';

                return (
                    <div>
                        {trustee?.name} {trustee?.last_name}
                        <br/>
                        {record.meeting_activities?.trustee_description && `(${record.trustee_description})`}
                    </div>
                )
            },
        },
        // {
        //     title: 'بازه زمانی',
        //     key: 'dateRange',
        //     render: (record) => (
        //         <div>
        //             از: {record.from_date}
        //             <br/>
        //             تا: {record.to_date}
        //         </div>
        //     ),
        // },
        {
            title: 'وضعیت',
            key: 'state',
            render: (record) => {
                // console.log(record)
                const getStateInfo = (state) => {
                    const states = {
                        10: {label: "در انتظار تایید", status: "warning"},
                        20: {label: "تایید شده", status: "success"},
                        30: {label: "انجام شده", status: "processing"},
                        40: {label: "رد شده", status: "error"},
                    };
                    return states[state] || {label: "نامشخص", status: "default"};
                };
                const stateInfo = getStateInfo(record.meeting_activities?.[0]?.state);

                return (
                    <Badge status={stateInfo.status} text={stateInfo.label}/>
                )
            },
        },
        // {
        //     title: 'تاریخ‌های مهم',
        //     key: 'importantDates',
        //     render: (record) => (
        //         <div>
        //             <div>تاریخ انجام: {record.done_date}</div>
        //             <div>تاریخ تایید: {record.confirmed_date}</div>
        //         </div>
        //     ),
        // },
        {
            title: 'فایل‌ها',
            key: 'files',
            render: (record) => {
                console.log(record)
                const base = BASEURL.replace("/api/v1", "");

                return (
                    <Flex vertical gap={4}>
                        {record?.meeting_activities?.[0]?.trustee_file && (
                            <Space>
                                <a
                                    href={`${base}${record?.meeting_activities?.[0]?.trustee_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: "#1890ff"}}
                                >
                                    مشاهده فایل متولی
                                </a>
                                <a
                                    href={`${base}${record.trustee_file}`}
                                    download
                                    style={{color: "#52c41a"}}
                                >
                                    دانلود
                                </a>
                            </Space>
                        )}
                        {record?.meeting_activities?.[0]?.plan_file && (
                            <Space>
                                <a
                                    href={`${base}${record?.meeting_activities?.[0]?.plan_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: "#1890ff"}}
                                >
                                    مشاهده فایل طرح
                                </a>
                                <a
                                    href={`${base}${record.plan_file}`}
                                    download
                                    style={{color: "#52c41a"}}
                                >
                                    دانلود
                                </a>
                            </Space>
                        )}
                    </Flex>
                );
            },
        }, {
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
};