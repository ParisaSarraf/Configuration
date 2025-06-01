import { Card } from "antd"
import ProductRequirementTree from "./components/ProductRequirementTree";
import ListOfProductsAcceptingTheRequirement from "./components/ListOfProductsAcceptingTheRequirement";
import { useProductContext } from "../../Services/Context/ProductContext";

const ProductRequirement = () => {
    const { currentProduct } = useProductContext();

    return (
        <Card
        >
            <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-2">
                <div className="col-span-1">
                    <ProductRequirementTree currentProduct={currentProduct} />
                </div>
                <div className="col-span-1">
                    <ListOfProductsAcceptingTheRequirement currentProduct={currentProduct} />
                </div>
            </div>

        </Card >
    )
}

export default ProductRequirement
