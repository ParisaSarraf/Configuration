import {Table, Tag} from "antd";
import {
    useGetConfirmedWarehouseRequestById
} from "@/QueryServises/RequestOfWarehouse/index.js";
import ListOfRequestOfWareHouseMadeCol
    from "@/pages/RequestOfWarehouse/components/ListOfRequestOfWareHouseMade/ListOfRequestOfWareHouseMadeCol.jsx";

const ListOfRequestOfWareHouseMade = ({currentProduct}) => {
    const {data: requestOfWarehouse} = useGetConfirmedWarehouseRequestById(currentProduct?.id);

    const expandedRowRender = (record) => {
        const nestedColumns = [
            {
                title: 'نام محصول',
                dataIndex: ['product', 'persian_title'],
                key: 'persian_title',
            },
            {
                title: 'کد محصول',
                dataIndex: ['product', 'code'],
                key: 'code',
                render: (record) => {
                    return (<Tag color={'orange'}>{record}</Tag>)
                }
            },
            {
                title: 'تعداد تایید شده',
                dataIndex: 'confirmed_number',
                key: 'confirmed_number',
            }
        ];

        const nestedDataSource = record.warehouse_request_numbers.map(item => ({
            key: item.id,
            product: item.product,
            confirmed_number: item.confirmed_number
        }));

        return (
            <Table
                columns={nestedColumns}
                dataSource={nestedDataSource}
                pagination={false}
                rowKey="key"
                bordered
                size={'small'}
            />
        );
    };

    return (
        <Table
            columns={ListOfRequestOfWareHouseMadeCol()}
            dataSource={requestOfWarehouse}
            pagination={false}
            rowKey='id'
            size={'small'}
            bordered
            expandedRowRender={expandedRowRender}
        />
    );
};

export default ListOfRequestOfWareHouseMade;
