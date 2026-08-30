import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/‎ProtectedRoute‎"
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import Documents from "./pages/Documents/Documents";
import Users from "./pages/Users/Users";
import Rols from "./pages/Rols/Rols";
import Setting from "./pages/Setting/Setting";
import GoodsCategories from "./pages/GoodsCategories/GoodsCategories";
import RoleLifeCycle from "./pages/RoleLifeCycle/RoleLifeCycle";
import Access from "./pages/Access/Access";
import Activity from "./pages/Activity/Activity";
import MyWork from "@/pages/MyWork/MyWork.jsx";
import SystemManagement from "@/pages/SystemManagement/index.jsx";
import UsersRole from "@/pages/SystemManagement/UsersRole.jsx";
import DetailAccessProduct from "@/pages/SystemManagement/DetailAccessProduct/DetailAccessProduct.jsx";
import UsersPerformance from "./pages/SystemManagement/UsersPerformance/UsersPerformance";
import ManageProduct from "./pages/SystemManagement/ManageProduct/ManageProduct";
import Plan from "./pages/Plan/Plan";
import InitialForm from "./pages/Forms/Form";
import FormBuilderStudio from "./pages/Forms/FormBuilderStudio/FormBuilderStudio";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <ProtectedRoute>
        <NotFound />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <GoodsCategories />
          </ProtectedRoute>
        ),
      },
      {
        path: "/get-product-activity-by-id/:productId",
        element: (
          <ProtectedRoute>
            <Activity />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
    errorElement: <NotFound />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management",
    element: (
      <ProtectedRoute>
        <SystemManagement />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/user",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/roles-users-product",
    element: (
      <ProtectedRoute>
        <Access />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/roles-users",
    element: (
      <ProtectedRoute>
        <UsersRole />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/roles-permission",
    element: (
      <ProtectedRoute>
        <Rols />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/roles-life-cycle",
    element: (
      <ProtectedRoute>
        <RoleLifeCycle />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/detail-access-product",
    element: (
      <ProtectedRoute>
        <DetailAccessProduct />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/users-performance",
    element: (
      <ProtectedRoute>
        <UsersPerformance />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/system-management/manage-product",
    element: (
      <ProtectedRoute>
        <ManageProduct />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/datas",
    element: (
      <ProtectedRoute>
        <Setting />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/panel/document/list",
    element: (
      <ProtectedRoute>
        <Documents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-work",
    element: (
      <ProtectedRoute>
        <MyWork />
      </ProtectedRoute>
    ),
  },
  {
    path: "/plan",
    element: (
      <ProtectedRoute>
        <Plan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forms",
    element: (
      <ProtectedRoute>
        <InitialForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forms/:formDefinitionId/studio",
    element: (
      <ProtectedRoute>
        <FormBuilderStudio />
      </ProtectedRoute>
    ),
  },
]);

export default router;
