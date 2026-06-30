import { useEffect } from "react";
import {
  createBrowserRouter,
  useRouteError,
  Outlet,
  useLocation,
} from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import VerificationSuccess from "../pages/auth/VerificationSuccess";
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
import Home from "../pages/Home";
import EventDetails from "../pages/EventDetails";
import AddGuest from "../pages/AddGuest";

// 1. Global wrapper to enforce scroll to top on route changes and reloads
function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}

function ErrorHandler() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-500">Oops!</h1>
      <p className="mt-4">Sorry, an unexpected error has occurred.</p>
      <p className="mt-2 text-slate-500">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorHandler />,
    children: [
      {
        path: "/",
        element: <Home />,
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
        path: "/otp",
        element: <Otp />,
      },
      {
        path: "/verification-success",
        element: <VerificationSuccess />,
      },

      {
        path: "/dashboard",
        element: <ProtectedRoute />, //Checks if user is logged in
        errorElement: <ErrorHandler />,
        children: [
          {
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
                path: "add-guest",
                element: <AddGuest />,
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
        ],
      },
    ],
  },
]);
