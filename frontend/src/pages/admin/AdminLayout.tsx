import type React from "react";
import { useState, useEffect } from "react";
import { socketService } from "../../services/socketService";
import { Cog, Settings2 } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const menuItems = [
  { id: "system", label: "System", icon: Cog },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    console.log("🔌 Initializing WebSocket connection...");
    socketService.connect();

    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsSocketConnected(connected);
      if (!connected) {
        setConnectionAttempts((prev) => prev + 1);
      } else {
        setConnectionAttempts(0);
      }
    };

    const interval = setInterval(checkConnection, 2000);
    checkConnection();
    return () => clearInterval(interval);
  }, []);

  const handleRetryConnection = () => {
    console.log("🔄 Manual retry connection...");
    // socketService.retry();
    setConnectionAttempts(0);
  };

  return (
    <div className="flex h-screen bg-gray-100 w-screen">
      <AdminSidebar
        activeView={pathname}
        setActiveView={(id) => {
          navigate(id);
        }}
        menuItems={menuItems}
      />
      <div className="flex-1 overflow-auto relative">
        {/* Connection indicator */}
        <div className="fixed top-4 right-4 z-30">
          <div
            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              isSocketConnected
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isSocketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {isSocketConnected ? "Live Updates" : "⚠️ Disconnected"}
          </div>
          {!isSocketConnected && connectionAttempts > 3 && (
            <button
              onClick={handleRetryConnection}
              className="mt-2 w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>

        {/* Where child routes render */}
        <div className="pt-16 lg:pt-0 p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
