import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import ContextProvider from "./Services/AuthContext.jsx";

const App = () => {
  return (
    <ContextProvider>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ContextProvider>
  );
};

export default App;