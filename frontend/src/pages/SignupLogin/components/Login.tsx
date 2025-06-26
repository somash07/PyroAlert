import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import API from "@/config/baseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
     defaultValues: {
    identifier: "",
    password: "",
  },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await API.post("/api/v1/user/sign-in", data);
      const { accessToken, user } = response.data.data;
      
      // Store tokens if needed

      localStorage.setItem("token", accessToken as string);
      localStorage.setItem("userInfo", JSON.stringify(user));

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4"></div>
        <CardTitle className="text-2xl font-semibold font-bitter text-orange-400">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Username/Email Address
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              autoComplete="off"
              className={`h-11 ${
                errors.identifier
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              {...register("identifier")}
            />
            {errors.identifier && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.identifier.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="off"
                className={`h-11 pr-10 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-orange-400 focus:ring-orange-500 rounded cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm ">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm text-orange-400 hover:text-orange-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-orange-400 hover:bg-orange-500 cursor-pointer text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {"Don't have an account? "}
          <button
            className="text-orange-400 hover:text-orange-500 font-medium cursor-pointer"
            onClick={() => navigate("/joinus/register")}
          >
            Sign up here
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
