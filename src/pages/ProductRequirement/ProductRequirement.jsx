import { Card } from "antd";
import { useState } from "react";
import ProductRequirementTree from "./components/ProductRequirementTree";
import ListOfProductsAcceptingTheRequirement from "./components/ListOfProductsAcceptingTheRequirement";
import { useProductContext } from "../../Services/Context/ProductContext";

// A product switch resets selection, modals and the acceptor panel together.
function RequirementWorkspace({ currentProduct }) {
  const [selectedEdition, setSelectedEdition] = useState(null);
  return <Card title={`الزامات ${currentProduct?.name || ""}`}>
    <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-4">
      <div className="col-span-1 min-w-0">
        <ProductRequirementTree currentProduct={currentProduct}
          setSelectedEdition={setSelectedEdition} />
      </div>
      <div className="col-span-1 min-w-0">
        <ListOfProductsAcceptingTheRequirement selectedEdition={selectedEdition} />
      </div>
    </div>
  </Card>;
}
export default function ProductRequirement() {
  const { currentProduct } = useProductContext();
  return <RequirementWorkspace key={currentProduct?.id ?? "no-product"} currentProduct={currentProduct} />;
}
