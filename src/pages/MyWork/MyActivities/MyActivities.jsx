import {Card, Table} from "antd";
import {useGetExpertActivity} from "@/QueryServises/PanelQuery/index.js";
import {MyActivitiesCols} from "@/pages/MyWork/MyActivities/MyActivitiesCols.jsx";
import {useNavigate} from "react-router-dom";

const MyActivities = () => {
    const {data : MyActivitiesData} = useGetExpertActivity()
    const navigate = useNavigate();

    const expandedRowRender = (record) => {
        const isMeeting = !!record.meeting;

        const baseColumns = [
            {
                title: "نام محصول",
                dataIndex: "persian_title",
                key: "persian_title",
                render: (_, row) => row.persian_title || row.meeting?.product?.persian_title
            },
            {
                title: "کد محصول",
                dataIndex: "code",
                key: "code",
                render: (_, row) => row.code || row.meeting?.product?.code
            },
            {
                title: "تعداد",
                dataIndex: "quantity",
                key: "quantity",
                render: (_, row) => row.quantity || row.meeting?.product?.quantity
            },
            {
                title: "قیمت",
                dataIndex: "price",
                key: "price",
                render: (_, row) => row.price || row.meeting?.product?.price
            },
            {
                title: "توضیحات",
                dataIndex: "description",
                key: "description",
                render: (_, row) => row.description || row.meeting?.product?.description
            }
        ];

        const meetingColumns = [
            {
                title: "نام صورتجلسه",
                dataIndex: ["meeting", "title"],
                key: "meeting_title"
            },
            {
                title: "کد صورتجلسه",
                dataIndex: ["meeting", "full_code"],
                key: "meeting_code"
            }
        ];
        const columns = isMeeting
            ? [...meetingColumns, ...baseColumns]
            : baseColumns;
        const productData = record.product || record.meeting?.product;
        return productData ? (
            <Table
                columns={columns}
                dataSource={[productData]}
                pagination={false}
                rowKey="id"
            />
        ) : null;
    };

        return (
            <Card>
                <Table
                    expandedRowRender={expandedRowRender}
                    dataSource={MyActivitiesData || []}
                    pagination={false}
                    scroll={{ y: 300 }}
                    columns={MyActivitiesCols()}
                    size={"small"}
                    rowKey={record => record.id}
                    onRow={(record) => {
                        const productId = record.product?.id || record.meeting?.product?.id;
                        return {
                            onClick: () => {
                                if (productId) {
                                    navigate(`/product/${productId}/activities`);
                                }
                            }
                        };
                    }}
                />
            </Card>
        )
}
export default MyActivities;