import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import Projects from "./pages/Projects/Projects";
import NotFound from "./pages/NotFound/NotFound";
import Users from "./pages/Users/Users";
import ProtectedRoute from "./components/‎ProtectedRoute‎"
import UnderDevelopment from "./pages/UnderDevelopment/UnderDevelopment";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element:
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>,
    errorElement:
      <ProtectedRoute>
        <NotFound />
      </ProtectedRoute>,
    children: [
      {
        index: true,
        element:
          <ProtectedRoute>
            <UnderDevelopment />
          </ProtectedRoute>,
      },
      {
        path: "/panel/users/list",
        element:
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>,
      },
      {
        path: "/panel/projects",
        element:
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>,
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