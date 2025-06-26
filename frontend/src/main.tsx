import { StrictMode } from "react";
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
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import FireStationDashboardLayout from "./layouts/FireStationDashboardLayout/FireStationDashboardLayout.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

const router = createBrowserRouter([
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
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
