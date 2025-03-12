import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/‎ProtectedRoute‎";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import UnderDevelopment from "./pages/UnderDevelopment/UnderDevelopment";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import SystemManagment from "./pages/SystemManagment";
import Documents from "./pages/Documents/Documents";

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
        path: "/panel/system-managment",
        element: (
          <ProtectedRoute>
            <SystemManagment />
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
]);

export default router;
