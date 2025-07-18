import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
}

const AdminProtected = ({ children }: ProtectedProps) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtected;
