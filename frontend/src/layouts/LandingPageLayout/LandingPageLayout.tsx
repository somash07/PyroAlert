import LandingNav from "@/components/LandingNav"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"


const LandingPageLayout = () => {
  return (
    <div>
      <ToastContainer position="bottom-left" />
        <LandingNav/>
        <Outlet/>
    </div>
  )
}

export default LandingPageLayout