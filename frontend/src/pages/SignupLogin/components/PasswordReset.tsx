"use client";

import type React from "react";
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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/config/baseUrl";
import toast from "react-hot-toast";

const codeVerificationSchema = z
  .object({
    email: z.string().email(),
    code: z
      .string()
      .min(6, "Verification code must be 6 digits")
      .max(6, "Verification code must be 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only numbers"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type OtpVerificationData = z.infer<typeof codeVerificationSchema>;

export default function PasswordReset({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OtpVerificationData>({
    resolver: zodResolver(codeVerificationSchema),
  });

  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setTimeLeft(60);
    setCodeInputs(newInputs);
    setValue("code", newInputs.join(""));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const split = pasted.split("");
      setCodeInputs(split);
      setValue("code", pasted);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setTimeLeft(60);
    try {
      await API.post("api/v1/user/get-verification-code", { email });
      toast.success(`Verification code resent to ${email}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend code");
    }
  };

  const onSubmit = async (data: OtpVerificationData) => {
    setIsLoading(true);
    try {
      const response = await API.post("/api/v1/user/reset-password", data);
      toast.success("Password reset successfully!");
      navigate("/joinus/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 flex justify-center items-center mb-20">
      <Card className="md:w-1/2  shadow-xl border-0 bg-white/95 backdrop-blur-sm  mx-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-600">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Code input fields */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {codeInputs.map((value, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) =>
                      handleCodeInputChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-lg font-semibold ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
              {errors.code && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.code.message}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center text-sm text-gray-600">
              {timeLeft > 0 ? (
                <span>Resend code in {formatTime(timeLeft)}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                autoComplete="off"
                {...register("newPassword")}
                className={`h-11 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.newPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.newPassword.message}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                className={`h-11 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-orange-400 hover:bg-orange-500 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <button
            onClick={() => navigate("/joinus/login")}
            className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
