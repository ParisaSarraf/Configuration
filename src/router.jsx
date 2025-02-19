import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/Layouts/MainLayout";
import SignIn from "./components/SignIn/SignIn";
// import SignOut from "./components/SignOut/SignOut"; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      // {
      //   path: "signIn",
      //   element: <SignIn />,
      // },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
  {
    path: "/signIn",
    element: <SignIn />,
  },
]);

export default router;