import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/‎ProtectedRoute‎";
import SignIn from "./components/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import SystemManagment from "./pages/SystemManagment";
import Documents from "./pages/Documents/Documents";
import Users from "./pages/Users/Users"
import Rols from "./pages/Rols/Rols";
import Setting from "./pages/Setting/Setting";
import GoodsCategories from "./pages/GoodsCategories/GoodsCategories";
import RoleLifeCycle from "./pages/RoleLifeCycle/RoleLifeCycle";
import Access from "./pages/Access/Access";
import UsersRole from "./pages/SystemManagment/UsersRole";

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

    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
    errorElement: <NotFound />
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment",
    element: (
      <ProtectedRoute>
        <SystemManagment />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment/user",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment/roles-users-product",
    element: (
      <ProtectedRoute>
        <Access />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment/roles-users",
    element: (
      <ProtectedRoute>
        <UsersRole />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment/roles-permission",
    element: (
      <ProtectedRoute>
        <Rols />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/system-managment/roles-life-cycle",
    element: (
      <ProtectedRoute>
        <RoleLifeCycle />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/datas",
    element: (
      <ProtectedRoute>
        <Setting />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/panel/document/list",
    element: (
      <ProtectedRoute>
        <Documents />
      </ProtectedRoute>
    ),
  },
]);

export default router;
