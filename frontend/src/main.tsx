import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignupLogin from "./pages/SignupLogin/SignupLogin.tsx";
import Login from "./pages/SignupLogin/components/Login.tsx";
import SignUp from "./pages/SignupLogin/components/SignUp.tsx";
import LandingPageLayout from "./layouts/LandingPageLayout/LandingPageLayout.tsx";
import OtpVerification from "./pages/SignupLogin/components/OtpVerification.tsx";
import ProtectedOTP from "./pages/SignupLogin/components/ProtectedOTP.tsx";
import ClientRequestPage from "./pages/ClientRequestPage/ClientRequestPage.tsx";

import About from "./pages/About.tsx";
import Home from "./pages/Home.tsx";
import Contact from "./pages/Contact.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPageLayout />,
    children: [
      {
        path: "/about-us",
        element: <About />,
      },
      {
        path: "/home",
        element: <Home />,
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
        path: "joinus",
        element: <SignupLogin />,
        children: [
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
                <OtpVerification />
              </ProtectedOTP>
            ),
          },
        ],
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
