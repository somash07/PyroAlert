import LandingNav from "@/components/LandingNav"
import { Outlet } from "react-router-dom"
import { Toaster } from "react-hot-toast"


const LandingPageLayout = () => {
  return (
    <div>
      <Toaster position="bottom-left" />
        <LandingNav/>
        <Outlet/>
    </div>
  )
}

export default LandingPageLayout