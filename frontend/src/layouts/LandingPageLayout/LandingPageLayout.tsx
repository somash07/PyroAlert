import LandingNav from "@/components/LandingNav";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import { AnimatePresence } from "framer-motion";

import ScrollToTop from "@/components/ScrollToTop";

const LandingPageLayout = () => {
  const location = useLocation();

  return (
    <div>
      <Toaster position="bottom-right" />
      <LandingNav />
      <AnimatePresence mode="wait">
        <ScrollToTop />

        <Outlet key={location.pathname} />
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default LandingPageLayout;
