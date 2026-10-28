import {ConfigProvider} from "antd";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ProductProvider} from "./Services/Context/ProductContext.jsx";
import ContextProvider from "./Services/Context/AuthContext.jsx";
import fa_IR from "antd/locale/fa_IR";
import {ProductThemeProvider, useProductTheme} from "./components/Theme/ProductThemeContext.jsx";
import {getProductThemeConfig, getProductThemeVariables} from "./components/Theme/productThemes.js";
import "./styles/theme-utilities.css";
import "./styles/theme-consistency.css";

const ThemedApplication = () => {
    const {globalTheme} = useProductTheme();
    return (
        <ContextProvider>
            <ProductProvider>
                <ConfigProvider direction="rtl" locale={fa_IR} theme={getProductThemeConfig(globalTheme)}>
                    <div className="app-theme-root" data-theme={globalTheme} style={getProductThemeVariables(globalTheme)}>
                        <RouterProvider router={router}/>
                    </div>
                </ConfigProvider>
            </ProductProvider>
        </ContextProvider>
    );
};

const App = () => (
    <ProductThemeProvider>
        <ThemedApplication/>
    </ProductThemeProvider>
);

export default App;