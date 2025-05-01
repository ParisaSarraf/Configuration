import { useProductById } from "../../../QueryServises/productQuery";

const ProductDocumentTree = () => {
    const { data: productDocument } = useProductById();

    return (
        <div>

        </div>
    )
}

export default ProductDocumentTree
