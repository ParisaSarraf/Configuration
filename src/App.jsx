import {ConfigProvider} from "antd";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ProductProvider} from "./Services/Context/ProductContext.jsx";
import ContextProvider from "./Services/Context/AuthContext.jsx";
import fa_IR from "antd/locale/fa_IR";
import {ProductThemeProvider} from "./components/Theme/ProductThemeContext.jsx";

const App = () => {
    return (
        <ProductThemeProvider>
            <ContextProvider>
                <ProductProvider>
                    <ConfigProvider direction="rtl" locale={fa_IR}>
                        <RouterProvider router={router}/>
                    </ConfigProvider>
                </ProductProvider>
            </ContextProvider>
        </ProductThemeProvider>
    );
};

export default App;