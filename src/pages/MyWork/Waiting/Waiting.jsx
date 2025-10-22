import {Card, Table, Tag, Tooltip} from "antd";
import {useGetExpertActivityInPlanState} from "@/QueryServises/PanelQuery/index.js";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

const Waiting = () => {
    const {data, isFetching} = useGetExpertActivityInPlanState();

    const cols = [
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
            title: 'عنوان فعالیت/محصول',
            key: 'title',
            render: (text, record) => record.product?.persian_title || record.meeting?.title || '---',
        },
        {
            title: 'کد ',
            dataIndex: 'full_code',
            key: 'full_code',
            width: 150,
            render: (type) => {
                return (
                    <Tag color={'processing'}>{type}</Tag>
                )
            },
        },
        {
            title: 'از تاریخ',
            dataIndex: 'from_date',
            key: 'from_date',
            width: 100,
            render: (type) => {
                return (
                    <Tag color={'orange'}>{georgianDateToJalaliDate(type)}</Tag>
                )
            },
        },
        {
            title: 'تا تاریخ',
            dataIndex: 'to_date',
            key: 'to_date',
            width: 100,
            render: (type) => {
                return (
                    <Tag color={"lime"}>{georgianDateToJalaliDate(type)}</Tag>
                )
            },
        },

        {
            title: 'شرح',
            dataIndex: 'description',
            key: 'description',
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
    ];

    return (
        <Card title="فعالیت‌های منتظر تایید/اقدام">
            <Table
                dataSource={data || []}
                loading={isFetching}
                columns={cols}
                pagination={{
                    defaultPageSize: 5,
                    pageSizeOptions: [10, 20, 45,100],
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