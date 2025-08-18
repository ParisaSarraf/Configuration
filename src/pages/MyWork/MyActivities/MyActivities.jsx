import {Card, Table} from "antd";
import {useGetExpertActivity} from "@/QueryServises/PanelQuery/index.js";
import {MyActivitiesCols} from "@/pages/MyWork/MyActivities/MyActivitiesCols.jsx";

const MyActivities = () => {
    const {data : MyActivitiesData} = useGetExpertActivity()
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
                    expandedRowRender={expandedRowRender}
                    dataSource={MyActivitiesData || []}
                    pagination={false}
                    scroll={{ y: 300 }}
                    columns={MyActivitiesCols()}
                    size={"small"}
                    // onRow={(record) => {
                    //     return (
                    //     <Tooltip title="جزئیات">
                    //         <Button
                    //             icon={<EyeOutlined/>}
                    //             className="text-sky-500 border-sky-500"
                    //             onClick={() => {
                    //                 navigate(`/product/${record.product_id}/activities`)
                    //             }}
                    //         />
                    //     </Tooltip>
                    //     )
                    // }}
                />
            </Card>
        )
}
export default MyActivities;