import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users/Users";
import ProtectedRoute from "./components/‎ProtectedRoute‎"
import UnderDevelopment from "./pages/UnderDevelopment";

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
        path: "/users/list",
        element:
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>,
      },
      {
        path: "/projects",
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
]);

export default router;