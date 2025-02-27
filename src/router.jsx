import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users/Users";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Users />,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
]);

export default router;