import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorBgBase: '#f3f4f6',
          colorTextBase: '#1f2937',
        },
        components: {
          Layout: {
            colorBgHeader: '#3b82f6',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;