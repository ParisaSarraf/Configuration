import React, { createContext, useState, useContext } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);

  const handleProductSelect = (productData) => {
    const product = {
      id: productData.id,
      serials: productData.serials,
      // name: productData.persian_title || 'محصول بدون نام',
      ...productData
    };
    setCurrentProduct(product);
    if (!activeProducts.some((p) => p.id === product.id)) {
      setActiveProducts([...activeProducts, product]);
    }
  };

  const closeProductTab = (productId) => {
    setActiveProducts(activeProducts.filter((p) => p.id !== productId));
    if (currentProduct?.id === productId) {
      setCurrentProduct(activeProducts[0] || null);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        activeProducts,
        currentProduct,
        handleProductSelect,
        closeProductTab,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
