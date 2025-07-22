import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../../validators/signupValidators";
import type { Schema } from "../../../validators/signupValidators";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import API from "@/config/baseUrl";
import ErrorText from "@/components/ErrorText";
import { useState } from "react";
import { MapPin } from "lucide-react";
import useGeolocation from "@/hooks/useGeolocation";

function Signup() {
  const [disable, setDisable] = useState<boolean>(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const navigate = useNavigate();
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(signupSchema),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: "Firedepartment",
      location: {
        lat: 0,
        lng: 0,
      },
    },
  });

  const { getPosition, isLoading } = useGeolocation();

  const handleAllowLocation = async () => {
    const coords = await getPosition();
    if (coords) {
      setValue("location.lat", coords.lat);
      setValue("location.lng", coords.lng);
      setLocation({ lat: coords.lat, lng: coords.lng });
      toast.success("Location access granted");
      setDisable(false);
    } else {
      toast.error(
        "Location permission denied. Enable it in your browser settings and try again."
      );
      setDisable(true);
      setLocation({ lat: 0, lng: 0 });
    }
  };

  const onSubmit = async (data: Schema) => {
    if (!data.location.lat || !data.location.lng) {
      toast.error("Please allow location access before signing up.");
      return;
    }

    try {
      console.log(data);
      const response = await API.post("/api/v1/user/sign-up", data);
      sessionStorage.setItem("otpUser", data.username);

      // // On successful OTP verification
      // sessionStorage.removeItem("otpUser");

      toast.success(response.data.message);
      navigate(`/joinus/otp-verification/${data.username}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
    }

    reset();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full p-9 space-y-4 overflow-y-auto-auto "
      >
        <div className="space-y-3 flex flex-col items-center">
          <h2 className="text-center font-semibold text-orange-400 text-2xl font-bitter">
            Register as a FireStation
          </h2>
          <p className="font-roboto text-sm font-light">
            Register your fire station with our emergency response network
          </p>
        </div>
        <input
          {...register("username")}
          placeholder="Enter Fire Station name "
          type="text"
          className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
          autoComplete="off"
        />
        {errors.username && (
          <ErrorText message={errors.username.message as string} />
        )}

        <input
          {...register("email")}
          type="email"
          placeholder="Enter company's email "
          className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
          autoComplete="off"
        />
        {errors.email && <ErrorText message={errors.email.message as string} />}

        <input
          {...register("password")}
          placeholder="Enter Password"
          type="password"
          className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
          autoComplete="off"
        />
        {errors.password && (
          <ErrorText message={errors.password.message as string} />
        )}

        <input
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
          type="password"
        />
        {errors.confirmPassword && (
          <ErrorText message={errors.confirmPassword.message as string} />
        )}

        <div className="flex w-full justify-between gap-3 bg-gray-100 p-3 rounded-md">
          {location.lat === 0 ? (
            <span className="text-sm">
              To continue, please turn on location and ensure you're at the fire station
            </span>
          ) : (
            <span className="text-green-500">
              {" "}
              Fire Station's location successfully captured!
            </span>
          )}
          <Button
            className="cursor-pointer hover:bg-stone-100"
            variant="outline"
            onClick={handleAllowLocation}
            disabled={isLoading}
          >
            <MapPin className="h-4 w-4" />
            Allow location
          </Button>
        </div>

        <Button
          type="submit"
          disabled={disable}
          className="bg-orange-400 cursor-pointer hover:bg-orange-500"
        >
          Signup
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
          {"Already have an account? "}
          <button
            className="text-orange-400 hover:text-orange-500 font-medium cursor-pointer"
            onClick={() => navigate("/joinus/login")}
          >
            Login here
          </button>
        </div>
    </>
  );
}

export default Signup;
