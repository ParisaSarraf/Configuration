import { Card } from "antd";
import { useState } from "react";
import ProductRequirementTree from "./components/ProductRequirementTree";
import ListOfProductsAcceptingTheRequirement from "./components/ListOfProductsAcceptingTheRequirement";
import { useProductContext } from "../../Services/Context/ProductContext";

// A product switch resets selection, modals and the acceptor panel together.
function RequirementWorkspace({ currentProduct, onOpenProduct, focusEditionId }) {
  const [selectedEdition, setSelectedEdition] = useState(null);
  return <Card title={`الزامات ${currentProduct?.name || ""}`}>
    <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-4">
      <div className="col-span-1 min-w-0">
        <ProductRequirementTree currentProduct={currentProduct}
          setSelectedEdition={setSelectedEdition} focusEditionId={focusEditionId} />
      </div>
      <div className="col-span-1 min-w-0">
        <ListOfProductsAcceptingTheRequirement selectedEdition={selectedEdition} onOpenProduct={(product) => onOpenProduct(product, selectedEdition?.id)} />
      </div>
    </div>
  </Card>;
}
export default function ProductRequirement() {
  const { currentProduct, activeProducts, handleProductSelect } = useProductContext();
  const [focus, setFocus] = useState(null);
  const openProduct = (product, editionId) => {
    if (product?.id == null) return;
    setFocus({ productId: product.id, editionId });
    const existing = activeProducts.find((item) => String(item.id) === String(product.id));
    // The acceptor endpoint may only supply id and title; preserve known fields.
    handleProductSelect({ ...existing, ...product, serials: existing?.serials ?? [] });
  };
  return <RequirementWorkspace key={currentProduct?.id ?? "no-product"}
    currentProduct={currentProduct} onOpenProduct={openProduct}
    focusEditionId={String(focus?.productId) === String(currentProduct?.id) ? focus?.editionId : null} />;
}
