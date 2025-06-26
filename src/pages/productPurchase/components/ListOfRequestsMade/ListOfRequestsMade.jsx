import {Table} from "antd";
import {useConfirmProductPurchaseById} from "@/QueryServises/productPurchase/index.js";
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";

const ListOfRequestsMade = ({currentProduct}) => {
    const {data: purchaseData} = useConfirmProductPurchaseById(currentProduct?.id);

    const expandedRowRender = (record) => {
        const nestedColumns = [
            {
                title: 'نام محصول',
                dataIndex: ['product', 'persian_title'],
                key: 'name',
            },
            {
                title: 'کد محصول',
                dataIndex: ['product', 'code'],
                key: 'code',
            },
            {
                title: 'تعداد تایید شده',
                dataIndex: 'confirmed_number',
                key: 'confirmed_number',
            }
        ];

        const nestedDataSource = record.product_purchase_numbers;

        return (
            <Table
                columns={nestedColumns}
                dataSource={nestedDataSource}
                pagination={false}
                rowKey="id"
            />
        );
    };

    return (
        <Table
            columns={ListOfRequestsMadeCol()}
            dataSource={purchaseData}
            pagination={false}
            rowKey='id'
            expandedRowRender={expandedRowRender}
        />
    );
};

export default ListOfRequestsMade;