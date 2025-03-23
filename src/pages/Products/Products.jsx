import { useProductList } from "../../QueryServises/productQuery"

const Products = () => {
    const { data: productData, refetch } = useProductList()
    return (
        <div>
           

        </div>
    )
}

export default Products
