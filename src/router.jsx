import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users/Users";
import ProtectedRoute from "./components/‎ProtectedRoute‎"

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
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