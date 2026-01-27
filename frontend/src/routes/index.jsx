import { createBrowserRouter } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import Verificationsuccess from "../pages/auth/Verificationsuccess";
import Dashboard from "../pages/Dashboard";
import MyEvents from "../pages/MyEvents";
import CreateEvent from "../pages/CreateEvent";
import GuestManagement from "../pages/GuestManagement";
import Analytics from "../pages/Analytics";
import HelpCenter from "../pages/HelpCenter";
import Settings from "../pages/Settings";
import Login from "../pages/auth/Login";
import Otp from "../pages/auth/Otp";
import Signup from "../pages/auth/Signup";
import Magiclink from "../pages/auth/MagicLink";
import Home from "../pages/Home";
import EventDetails from "../pages/EventDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
    // errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/magic-link",
    element: <Magiclink />,
  },
  {
    path: "/otp",
    element: <Otp />,
  },
  {
    path: "/verification-success",
    element: <Verificationsuccess />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "my-events",
        element: <MyEvents />,
      },
      {
        path: "event/:id",
        element: <EventDetails />,
      },
      {
        path: "create-event",
        element: <CreateEvent />,
      },
      {
        path: "guest-management",
        element: <GuestManagement />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "help-center",
        element: <HelpCenter />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
