import { Card } from "antd";
import Tree from "../../../components/Tree";
import { useProductRequirementAcceptor } from "../../../QueryServises/productRequirementQuery";

const ListOfProductsAcceptingTheRequirement = ({ setSelectProduct, selectedProductRequirement }) => {
    const { data: productList = [], isLoading } = useProductRequirementAcceptor(selectedProductRequirement);

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