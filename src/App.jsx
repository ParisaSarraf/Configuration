import {ConfigProvider, Empty, theme} from "antd";
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
 renderEmpty={() => (
 <Empty
 image={Empty.PRESENTED_IMAGE_SIMPLE}
 description="اطلاعاتی برای نمایش وجود ندارد"
 />
 )}
 theme={{
 algorithm: theme.compactAlgorithm,
 token: {
 borderRadius: 10,
 borderRadiusLG: 12,
 colorPrimary: "#315CFF",
 colorInfo: "#315CFF",
 colorSuccess: "#16A36A",
 colorWarning: "#D97706",
 colorError: "#DC4C4C",
 colorText: "#172033",
 colorTextSecondary: "#667085",
 colorBorder: "#E3E8EF",
 colorBgLayout: "#F5F7FA",
 colorBgContainer: "#FFFFFF",
 fontSize: 14,
 controlHeight: 36,
 wireframe: false,
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
