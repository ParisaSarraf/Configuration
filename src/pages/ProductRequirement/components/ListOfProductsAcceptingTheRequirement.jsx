import { Card } from "antd";
import { useProductChildren } from "../../../QueryServises/productQuery";
import Tree from "../../../components/Tree";

const ListOfProductsAcceptingTheRequirement = ({ currentProduct, setSelectProduct }) => {
    const { data: productList = [], isLoading } = useProductChildren(currentProduct?.id);

    const transformDataToTreeView = (productList) => {
        if (!productList) return [];
        const transformNode = (node) => ({
            title: `${node.persian_title}- (${node.code})`,
            id: node.id,
            children: node.children && node.children.length > 0
                ? node.children.map(child => transformNode(child))
                : undefined,
        });
        const productDoc = Array.isArray(productList) ? productList : [productList];
        return productDoc.map((document) => transformNode(document));
    };
    const treeData = transformDataToTreeView(productList);


    return (
        <Card
            title="لیست محصولات پذیرنده الزام"
            loading={isLoading}
        >
            <Tree
                mode="tree"
                data={treeData}
                showLine
                checkable={false}
                onSelect={(selectedKeys, { node }) => {
                    setSelectProduct(node.id)
                }}
            />
        </Card>
    );
};

export default ListOfProductsAcceptingTheRequirement;