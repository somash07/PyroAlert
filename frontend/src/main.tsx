import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import SignupLogin from "./pages/SignupLogin/SignupLogin.tsx";
import Login from "./pages/SignupLogin/components/Login.tsx";
import SignUp from "./pages/SignupLogin/components/SignUp.tsx";
import LandingPageLayout from "./layouts/LandingPageLayout/LandingPageLayout.tsx";
import ProtectedOTP from "./pages/SignupLogin/components/ProtectedOTP.tsx";
import ClientRequestPage from "./pages/ClientRequestPage/ClientRequestPage.tsx";

import About from "./pages/About/About.tsx";
import Home from "./pages/Home.tsx";
import Contact from "./pages/Contact.tsx";
import ResetPassword from "./pages/SignupLogin/components/ResetPassword.tsx";
import EmailVerification from "./pages/SignupLogin/components/EmailVerification.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import FireStationDashboardLayout from "./layouts/FireStationDashboardLayout/FireStationDashboardLayout.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Toaster } from "@/components/ui/sonner"
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import System from "./pages/admin/system/index.tsx";
import Settings from "./pages/admin/settings/index.tsx";
import NotFound from "./pages/NotFound/index.tsx";
import AdminProtected from "./components/AdminProtected.tsx";
import Firefighters from "./pages/admin/system/firefighters/index.tsx";
import Departments from "./pages/admin/system/departments/index.tsx";
import Clients from "./pages/admin/system/clients/index.tsx";
import FirefighterPasswordReset from "./pages/FirefighterPasswordReset.tsx";

const router = createBrowserRouter([
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtected>
        <AdminLayout />
      </AdminProtected>
    ),
    children: [
      {
        index: true,
        element: <System />,
      },
      {
        path: "system",
        element: <System />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "firefighters",
        element: <Firefighters />,
      },
      {
        path: "departments",
        element: <Departments />,
      },
      {
        path: "clients",
        element: <Clients />,
      },
    ],
  },
  {
    path: "/",
    element: <LandingPageLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "/about-us",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/client-request",
        element: <ClientRequestPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },

      {
        path: "joinus",
        element: <SignupLogin />,
        children: [
          {
            index: true,
            element: <Navigate to="login" replace />,
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <SignUp />,
          },
          {
            path: "otp-verification/:username",
            element: (
              <ProtectedOTP>
                <EmailVerification />
              </ProtectedOTP>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Provider store={store}>
          <FireStationDashboardLayout />
        </Provider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <FirefighterPasswordReset />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Toaster position="top-center" />
    <RouterProvider router={router} />
  </Provider>
);
