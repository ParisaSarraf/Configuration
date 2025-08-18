import {Button, Space, Tag, Tooltip} from "antd";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";
import {CheckOutlined, EyeOutlined, FolderAddOutlined, UserAddOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

export const MyActivitiesCols = () => {

    const navigate = useNavigate();
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
        render: (type) =>{
            return (
                <Tag>{type === 'control project' ? 'کنترل پروژه' : 'صورتجلسه'}</Tag>
            )
        },
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
        render:(record) => {
            return (
                <Tag color="cyan">{record}</Tag>
            )
        },
    },
    {
        title: 'تاریخ شروع',
        dataIndex: 'from_date',
        key: 'from_date',
        render:(record) => {
            return (
                <Tag color="green">{georgianDateToJalaliDate(record)}</Tag>
            )
        },
    },
    {
        title: 'تاریخ پایان',
        dataIndex: 'to_date',
        key: 'to_date',
        render:(record) => {
            return (
                <Tag color="blue">{georgianDateToJalaliDate(record)}</Tag>
            )
        },
    },
    {
        title: 'وضعیت',
        dataIndex: 'state',
        key: 'state',
        render: (state) => {
            let status, color;
            switch (state) {
                case 10:
                    status = 'در انتظار';
                    color = 'orange';
                    break;
                case 20:
                    status = 'انجام شده';
                    color = 'blue';
                    break;
                case 30:
                    status = 'تایید شده';
                    color = 'green';
                    break;
                default:
                    status = 'نامشخص';
                    color = 'gray';
            }
            return <Tag color={color}>{status}</Tag>;
        },
    },
    {
        title: 'روز-نفر',
        dataIndex: 'person_day',
        key: 'person_day',
        render:(record) => {
            return (
                <Tag color="error">{record || 'ندارد'} </Tag>
            )
        },
    },
    {
        title: 'عملیات',
        key: 'actions',
        render: (record) => {
            // console.log(record);
            return (
                <Space direction="horizontal">
                        {/*<Tooltip title="انجام توسط متولی">*/}
                        {/*    <Button*/}
                        {/*        icon={<UserAddOutlined/>}*/}
                        {/*        className={"text-orange-600 border-orange-600"}*/}
                        {/*        onClick={() => handleTrustee(record)}*/}
                        {/*        size="small"*/}
                        {/*    />*/}
                        {/*</Tooltip>*/}
                        {/*<Button*/}
                        {/*    icon={<CheckOutlined className={'text-orange-600 border-orange-600 '} />}*/}
                        {/*    className={'text-orange-600 border-orange-600 '}*/}
                        {/*    size="small"*/}
                        {/*    type={'text'}*/}
                        {/*/>*/}
                        {/*<Tooltip title="انجام توسط طرح و برنامه">*/}
                        {/*    <Button*/}
                        {/*        icon={<FolderAddOutlined/>}*/}
                        {/*        className={ "text-pink-700 border-pink-700"}*/}
                        {/*        onClick={() => handlePlan(record)}*/}
                        {/*        size="small"*/}
                        {/*    />*/}
                        {/*</Tooltip>*/}
                        {/*<Button*/}
                        {/*    type={'text'}*/}
                        {/*    icon={<CheckOutlined className={'text-pink-700 border-pink-700 '} />}*/}
                        {/*    className={'text-pink-700 border-pink-700 '}*/}
                        {/*    size="small"*/}
                        {/*/>*/}
                        <Tooltip title="جزئیات">
                                 <Button
                                icon={<EyeOutlined/>}
                                className="text-sky-500 border-sky-500"
                                onClick={() => {
                                    navigate(`/product/${record.product_id}/activities`)
                                }}
                            />
                        </Tooltip>
                </Space>
            )
        }
    }
]
)}