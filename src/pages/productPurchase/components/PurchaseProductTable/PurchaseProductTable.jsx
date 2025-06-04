import { Table } from "antd"
import PurchaseProductCol from "./PurchaseProductCol"
import { useProductPurchaseById } from "../../../../QueryServises/productPurchase"

const PurchaseProductTable = ({ currentProduct }) => {

    const { data: purchaseData, refetch } = useProductPurchaseById(currentProduct?.id)
    // console.log(purchaseData);

    return (
        <Table columns={PurchaseProductCol} dataSource={purchaseData} />
    )
}

export default PurchaseProductTable
