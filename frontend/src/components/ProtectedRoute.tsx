import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedProps) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/joinus/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
