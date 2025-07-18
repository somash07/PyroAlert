import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Ghost } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-100 px-4">
      <Ghost size={64} className="text-gray-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">404 – Page Not Found</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")}>Go back Home</Button>
    </div>
  );
};

export default NotFound;
