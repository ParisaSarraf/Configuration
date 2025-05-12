import Tree from "../../../components/Tree";
import { useProductById } from "../../../QueryServises/productQuery";

const ProductDocumentTree = (currentProduct) => {
    const selectedProductId = currentProduct?.currentProduct?.productData?.id
    const { data: productDocument, isLoading, isError } = useProductById(selectedProductId);
    const documentProducts = productDocument?.product_documents

    const transformDataToTreeView = (documentProducts) => {
        if (!documentProducts) return []
        const transformNode = (node) => ({
            title: node.title,
            id: node.id,
            gantDoc: node.gant_doc
        })
        const productDoc = Array.isArray(documentProducts) ? documentProducts : [documentProducts]
        return productDoc.map((document) => transformNode(document))
    }
    const treeData = transformDataToTreeView(documentProducts);

    return (
        <Tree
            mode="tree"
            data={treeData}
            isLoading={isLoading}
            isError={isError}
            showLine={true}
            checkable={true}
        />
    )
}

export default ProductDocumentTree
