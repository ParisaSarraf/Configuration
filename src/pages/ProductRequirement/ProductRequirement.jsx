import { Card } from "antd"
import ProductRequirementTree from "./components/ProductRequirementTree";
import ListOfProductsAcceptingTheRequirement from "./components/ListOfProductsAcceptingTheRequirement";
import { useProductContext } from "../../Services/Context/ProductContext";
import { useState } from "react";

const ProductRequirement = () => {
    const { currentProduct } = useProductContext();
    const [selectProduct, setSelectProduct] = useState(null)
    const [selectedProductRequirement, setSelectedProductRequirement] = useState(null);

    console.log(selectedProductRequirement);



    return (
        <Card
        >
            <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-2">
                <div className="col-span-1">
                    <ProductRequirementTree currentProduct={currentProduct} selectProduct={selectProduct} setSelectedProductRequirement={setSelectedProductRequirement} />
                </div>
                <div className="col-span-1">
                    <ListOfProductsAcceptingTheRequirement currentProduct={currentProduct} setSelectProduct={setSelectProduct} selectedProductRequirement={selectedProductRequirement} />
                </div>
            </div>

        </Card >
    )
}

export default ProductRequirement
