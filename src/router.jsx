import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/‎ProtectedRoute‎";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import Projects from "./pages/Projects/Projects";
import NotFound from "./pages/NotFound/NotFound";
import UnderDevelopment from "./pages/UnderDevelopment/UnderDevelopment";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import Users from "./pages/Users/Users";
import SystemManagment from "./pages/SystemManagment";

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
        path: "/panel/projects",
        element: (
          <ProtectedRoute>
            <Projects />
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
