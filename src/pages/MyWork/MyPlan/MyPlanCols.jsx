import {Button, Space, Tag, Tooltip} from "antd";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";
import {CheckOutlined, EyeOutlined, FolderAddOutlined} from "@ant-design/icons";

export const MyPlanCols = ({handleShowDetail, handlePlan}) => {
    return (
        [{
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
            {
                title: 'نوع فعالیت',
                dataIndex: 'type',
                key: 'type',
                render: (type) => {
                    return (
                        <Tag>{type === 'control project' ? 'کنترل پروژه' : 'صورتجلسه'}</Tag>
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
            {
                title: "کد محصول",
                key: "code",
                render: (_, row) => row.product?.code || row.meeting?.product?.code
            },
            {
                title: 'توضیحات',
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
                title: 'کد کامل',
                dataIndex: 'full_code',
                key: 'full_code',
                render: (record) => {
                    return (
                        <Tag color="cyan">{record}</Tag>
                    )
                },
            },
            {
                title: 'تاریخ شروع',
                dataIndex: 'from_date',
                key: 'from_date',
                render: (record) => {
                    return (
                        <Tag color="green">{georgianDateToJalaliDate(record)}</Tag>
                    )
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
                title: 'عملیات',
                key: 'actions',
                render: (record) => {
                    // console.log(record);
                    const isPlanDone = record.state === 20
                    return (
                        <Space direction="horizontal">
                            {!isPlanDone ? (
                                <Tooltip title="انجام توسط طرح و برنامه">
                                    <Button
                                        icon={<FolderAddOutlined/>}
                                        className={"text-pink-700 border-pink-700"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlan(record)
                                        }}
                                        size="small"
                                    />
                                </Tooltip>
                            ) : (
                                <Button
                                    type={'text'}
                                    icon={<CheckOutlined className={'text-pink-700 border-pink-700 '}/>}
                                    className={'text-pink-700 border-pink-700 '}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                />

                            )}
                            <Tooltip title="جزئیات">
                                <Button
                                    size="small"
                                    type={'text'}
                                    icon={<EyeOutlined/>}
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