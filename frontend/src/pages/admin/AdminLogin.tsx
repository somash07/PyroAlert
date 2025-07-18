"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { AppDispatch } from "../../store/store";
import { setUser } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import API from "@/config/baseUrl";
import { useNavigate } from "react-router-dom";

type FormData = {
  identifier: string;
  password: string;
};

const AdminLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const response = await API.post("/api/v1/user/admin/login", data);
      toast.success("Login Successful", {
        description: "Welcome back, Admin!",
      });
      const { accessToken, user } = response.data.data;

      localStorage.setItem("token", accessToken as string);
      localStorage.setItem("userInfo", JSON.stringify(user));
      dispatch(setUser(user));
      navigate("/admin/system");
    } catch (error: any) {
      console.error("Login error:", error);
      setServerError(
        error?.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 w-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                type="text"
                placeholder="Email or username"
                {...register("identifier", {
                  required: "Email or username is required",
                })}
              />
              {errors.identifier && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
