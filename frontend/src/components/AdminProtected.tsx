import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
}

const AdminProtected = ({ children }: ProtectedProps) => {
  const token = localStorage.getItem("token");
  const { user } = useSelector((state: any) => state.auth);

  if (!token && user.type !== "Admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtected;
