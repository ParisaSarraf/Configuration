import {Card, Table} from "antd";
import {useGetActivitiesInPlanState} from "@/QueryServises/PanelQuery/index.js";
import {MyActivitiesCols} from "@/pages/MyWork/MyActivities/MyActivitiesCols.jsx";

const MyPlan = () => {
    const {data: PlanData} = useGetActivitiesInPlanState();
    const expandedRowRender = (record) => {
        const columns = [
            {
                title: "نام محصول",
                dataIndex: "persian_title",
                key: "persian_title",
            },
            {
                title: "کد محصول",
                dataIndex: "code",
                key: "code",
            },
            {
                title: "تعداد",
                dataIndex: "quantity",
                key: "quantity",
            },
            {
                title: "قیمت",
                dataIndex: "price",
                key: "price",
                render: (price) => price.toLocaleString('fa-IR'),
            },
            {
                title: "توضیحات",
                dataIndex: "description",
                key: "description",
            }
        ];
        const productData = record.product;
        return <Table columns={columns} dataSource={[productData]} pagination={false} />;
    };

    return (
        <Card>
            <Table
                pagination={false}
                scroll={{ y: 300 }}
                dataSource={PlanData || []}
                columns={MyActivitiesCols()}
                expandable={{ expandedRowRender }}
                rowKey="id"
            />
        </Card>
    );
}

export default MyPlan;