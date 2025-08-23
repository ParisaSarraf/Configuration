import {ConfigProvider} from "antd";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ProductProvider} from "./Services/Context/ProductContext.jsx";
import ContextProvider from "./Services/Context/AuthContext.jsx";

const App = () => {
    return (
        <ContextProvider>
            <ProductProvider>
                <ConfigProvider>
                    <RouterProvider router={router}/>
                </ConfigProvider>
            </ProductProvider>
        </ContextProvider>
    );
};

export default App;