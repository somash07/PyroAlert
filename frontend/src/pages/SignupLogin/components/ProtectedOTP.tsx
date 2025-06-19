
import { useParams, Navigate } from "react-router-dom";

const ProtectedOTP = ({ children }: { children: React.ReactNode }) => {
  const { username } = useParams();
  const storedUser = sessionStorage.getItem("otpUser");

  if (storedUser !== username) {
    return <Navigate to="/joinus/register" replace />;
  }

  return <>{children}</>;
};

export default ProtectedOTP;
