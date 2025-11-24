import { Button, Space, Tag, Tooltip } from "antd";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { CheckOutlined, EyeOutlined, UserAddOutlined } from "@ant-design/icons";

export const MyActivitiesCols = ({ handleShowDetail, handleTrustee }) => {
    return (
        [{
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        // {
        //     title: 'نوع فعالیت',
        //     dataIndex: 'type',
        //     key: 'type',
        //     render: (type) => {
        //         return (
        //             <Tag>{type === 'control project' ? 'کنترل پروژه' : 'صورتجلسه'}</Tag>
        //         )
        //     },
        // },
        {
            title: 'مسئول',
            key: 'trustee',
            render: (text, record) => {
                const trusteeName = record.trustee?.name || '';
                const trusteeLastName = record.trustee?.last_name || '';
                return `${trusteeName} ${trusteeLastName}`.trim() || '---';
            },
        },
        {
            title: 'کد فعالیت',
            dataIndex: 'full_code',
            key: 'full_code',
            render: (type) => {
                return (
                    <Tag>{type}</Tag>
                )
            },
        },
        {
            title: "نام محصول",
            key: "persian_title",
            render: (_, row) => {
                return row.product?.persian_title || row.meeting?.product?.persian_title;
            }
        },
        // {
        //     title: "کد محصول",
        //     key: "code",
        //     render: (_, row) => row.product?.code || row.meeting?.product?.code
        // },
        {
            title: 'شرح فعالیت',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (description) => {
                return (
                    <Tooltip title={description}>
                        <Tag
                            color="purple"
                            style={{
                                maxWidth: 150,
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
            title: 'تاریخ پایان',
            dataIndex: 'to_date',
            key: 'to_date',
            render: (record) => {
                return (
                    <Tag color="blue">{georgianDateToJalaliDate(record)}</Tag>
                )
            },
        },
        {
            title: 'تاریخ تایید',
            dataIndex: 'done_date',
            key: 'done_date',
            render: (record) => {
                return (
                    <Tag color="green">{georgianDateToJalaliDate(record)}</Tag>
                )
            },
        },

        {
            title: 'عملیات',
            key: 'actions',
            render: (record) => {
                // console.log("record", record);
                const isTrustee = record?.state === 20
                return (
                    <Space direction="horizontal">
                        {isTrustee ? (
                            <Button
                                icon={<CheckOutlined className={'text-orange-600 border-orange-600 '} />}
                                className={
                                    'text-orange-600 border-orange-600 '
                                }
                                size="small"
                                type={'text'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        ) : (
                            <Tooltip title="انجام توسط متولی">
                                <Button
                                    icon={<UserAddOutlined />}
                                    className={"text-orange-600 border-orange-600"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTrustee(record);
                                    }}
                                    size="small"
                                />
                            </Tooltip>

                        )}
                        <Tooltip title="جزئیات">
                            <Button
                                size="small"
                                type={'text'}
                                icon={<EyeOutlined />}
                                className="text-sky-500 border-sky-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowDetail(record);
                                }}
                            />
                        </Tooltip>
                    </Space>
                )
            }
        }
        ]
    )
}