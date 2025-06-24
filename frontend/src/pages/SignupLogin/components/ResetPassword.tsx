import { useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router";
import API from "../../../config/baseUrl";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import OtpVerification from "./PasswordReset";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetPassword, setResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen justify-center w-screen items-center">
      <div className="h-[80%] w-[80%] flex ">
        {resetPassword ? (
          <OtpVerification email={email} />
        ) : (
          <div className="flex h-full w-full p-10 justify-center items-center gap-5">
            <IoArrowBackCircleSharp onClick={handleBack} size={40} />
            <div className="flex flex-col gap-9">
              <div className=" text-black">
                <h1 className="text-3xl font-semibold text-center">
                  Forgot you password?
                </h1>
                <p>
                  Please provide us with the email you used while registering
                  and receive a OTP.
                </p>
              </div>
              <input
                type="text"
                className="p-3 w-[90%]text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="bg-orange-400 hover:bg-orange-300"
                disabled={isLoading}
                onClick={async () => {
                  try {
                    setIsLoading(true)
                    const { data } = await API.post(
                      "/api/v1/user/get-verification-code",
                      {
                        email,
                      }
                    );
                    console.log(data);
                    setResetPassword(true);
                    toast.success(data.message);
                  } catch (e: any) {
                    toast.error(e.response.data.message);
                  }
                  finally{
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  "Verify Code"
                )}
                Request OTP
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
