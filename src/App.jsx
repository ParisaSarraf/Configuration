import {ConfigProvider} from "antd";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ProductProvider} from "./Services/Context/ProductContext.jsx";
import ContextProvider from "./Services/Context/AuthContext.jsx";
import fa_IR from "antd/locale/fa_IR";

const App = () => {
    return (
        <ContextProvider>
            <ProductProvider>
                <ConfigProvider direction="rtl" locale={fa_IR}>
                    <RouterProvider router={router}/>
                </ConfigProvider>
            </ProductProvider>
        </ContextProvider>
    );
};

export default App;