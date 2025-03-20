import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/‎ProtectedRoute‎";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import UnderDevelopment from "./pages/UnderDevelopment/UnderDevelopment";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import SystemManagment from "./pages/SystemManagment";
import Documents from "./pages/Documents/Documents";
import Users from "./pages/Users/Users"
import Permissions from "./pages/Permission/Permissions";
import Rols from "./pages/Rols/Rols";

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
            <UnderDevelopment />
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
    path: "/panel/system-managment/permissions",
    element: (
      <ProtectedRoute>
        <Permissions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/panel/system-managment/roles",
    element: (
      <ProtectedRoute>
        <Rols />
      </ProtectedRoute>
    ),
  },
]);

export default router;
