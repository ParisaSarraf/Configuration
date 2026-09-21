import {ConfigProvider, theme} from "antd";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ProductProvider} from "./Services/Context/ProductContext.jsx";
import ContextProvider from "./Services/Context/AuthContext.jsx";
import fa_IR from "antd/locale/fa_IR";

const App = () => {
    return (
        <ContextProvider>
            <ProductProvider>
                <ConfigProvider
                    direction="rtl"
                    locale={fa_IR}
                    componentSize="small"
                    theme={{
                        algorithm: theme.compactAlgorithm,
                        token: {
                            borderRadius: 8,
                            colorPrimary: "#2783de",
                            fontSize: 14,
                            controlHeight: 36,
                        },
                    }}
                >
                    <RouterProvider router={router}/>
                </ConfigProvider>
            </ProductProvider>
        </ContextProvider>
    );
};

export default App;
