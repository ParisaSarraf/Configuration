import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import ContextProvider from "./Services/AuthContext.jsx";
import { ProductProvider } from "./Services/ProductContext.jsx";

const App = () => {
  return (
    <ContextProvider>
      <ProductProvider>
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </ProductProvider>
    </ContextProvider>
  );
};

export default App;