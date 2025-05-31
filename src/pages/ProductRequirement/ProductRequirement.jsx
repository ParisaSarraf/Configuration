import { Card } from "antd"
import ProductRequirementTree from "./components/ProductRequirementTree";
import ListOfProductsAcceptingTheRequirement from "./components/ListOfProductsAcceptingTheRequirement";

const ProductRequirement = () => {

    return (
        <Card
        >
            <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-2">
                <div className="col-span-1">
                    <ProductRequirementTree  />
                </div>
                <div className="col-span-1">
                    <ListOfProductsAcceptingTheRequirement />
                </div>
            </div>

        </Card >
    )
}

export default ProductRequirement
