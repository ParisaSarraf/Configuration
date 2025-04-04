import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/‎ProtectedRoute‎";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import GoodsCategories from "./pages/GoodsCategories/GoodsCategories";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import SystemManagment from "./pages/SystemManagment";
import Documents from "./pages/Documents/Documents";
import Users from "./pages/Users/Users"
import Permissions from "./pages/Permission/Permissions";
import Rols from "./pages/Rols/Rols";
import Setting from "./pages/Setting/Setting";

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
        path: "/panel/document/list",
        element: (
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/panel/system-managment",
    element: (
      <ProtectedRoute>
        <SystemManagment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/panel/system-managment/user",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "/panel/system-managment/roles-users",
    element: (
      <ProtectedRoute>
        <Permissions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/panel/system-managment/roles-permission",
    element: (
      <ProtectedRoute>
        <Rols />
      </ProtectedRoute>
    ),
  },
  {
    path: "/panel/datas",
    element: (
      <ProtectedRoute>
        <Setting />
      </ProtectedRoute>
    ),
  },
]);

export default router;
