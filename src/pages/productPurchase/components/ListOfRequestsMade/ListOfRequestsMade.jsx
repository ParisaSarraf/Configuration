import { Table } from "antd";
import { useConfirmProductPurchaseById } from "../../../../QueryServises/productPurchase";
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";

const ListOfRequestsMade = ({ currentProduct }) => {
    const { data: purchaseData, refetch } = useConfirmProductPurchaseById(currentProduct?.id);

    return (
        <Table
            columns={ListOfRequestsMadeCol()}
            dataSource={purchaseData}
            pagination={false}
        />
    )
}

export default ListOfRequestsMade