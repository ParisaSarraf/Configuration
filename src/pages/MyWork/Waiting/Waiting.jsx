import {Card, Table, Tag, Tooltip} from "antd";
import {useGetExpertActivityInPlanState} from "@/QueryServises/PanelQuery/index.js";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

const Waiting = () => {
    const {data, isFetching} = useGetExpertActivityInPlanState();

    const cols = [{
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
    ]

    return (
        <Card title="فعالیت‌های منتظر تایید/اقدام">
            <Table
                dataSource={data || []}
                loading={isFetching}
                columns={cols}
                pagination={{
                    defaultPageSize: 5,
                    pageSizeOptions: [10, 20, 45, 100],
                    size: "small",
                    showSizeChanger: true,
                }}
                size={'small'}
                scroll={{x: 800}}
                rowKey="id"
            />
        </Card>
    )
}

export default Waiting;