import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Magiclink from "./pages/Magiclink"
import Otp from "./pages/Otp"
import Signup from "./pages/Signup"
import Verificationsuccessful from "./pages/Verificationsuccessful"
import { createBrowserRouter, RouterProvider } from "react-router";


function App() {
  
  return (
    <div>
      {/* <Home /> */}
      {/* <Signup /> */}
      {/* <Login /> */}
      {/* <Otp /> */}
      {/* <Magiclink /> */}
      {/* <Verificationsuccessful /> */}
      <RouterProvider router={router} />
    </div>
  )
}

export default App

 const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    // errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/otp",
    element: <Otp />,
  },
  {
    path: "/magiclink",
    element: <Magiclink />,
  },
  {
    path: "/verificationsuccessfull",
    element: <Verificationsuccessful />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

