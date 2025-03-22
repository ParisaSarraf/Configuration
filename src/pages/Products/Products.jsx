import { useProductList } from "../../QueryServises/productQuery"

const Products = () => {
    const { data: productData } = useProductList()
    return (
        <div>

        </div>
    )
}

export default Products
