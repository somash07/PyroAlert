import type React from "react";
import { useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import API from "@/config/baseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { resetAll } from "@/store/actions/resetAction";
import { logout } from "@/store/slices/authSlice";

interface FireStationSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  menuItems: { id: string; label: string; icon: any }[];
}

const FireStationSidebar: React.FC<FireStationSidebarProps> = ({
  activeView,
  setActiveView,
  menuItems,
}) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo")!);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSignOut = async () => {
    try {
      await API.post("/api/v1/user/logout");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      dispatch(resetAll());
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/joinus/login");
    } catch (err) {
      toast.error("Cannot logout! Please try again.");
    }
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = (itemId: string) => {
    setActiveView(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-red-700 text-white shadow-lg hover:bg-red-800 transition-colors"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[40]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FireStationSidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-red-800 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="px-3 ml-6">
         <img src="logo.png" alt="" className="w-1/2 "/>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center px-4 sm:px-6 py-3 text-left hover:bg-red-900 hover:cursor-pointer transition-colors ${
                  activeView === item.id
                    ? "bg-red-900 border-r-4 border-white"
                    : ""
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate text-sm sm:text-base">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-sm text-white font-bold capitalize">{user?.username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-xs sm:text-sm bg-red-900 hover:cursor-pointer hover:bg-red-500 rounded transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FireStationSidebar;
