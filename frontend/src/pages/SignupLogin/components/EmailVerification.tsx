
import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import API from "@/config/baseUrl"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

const emailVerificationSchema = z.object({
  verifyCode: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
})

type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>

export default function EmailVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""])
  const [isVerified, setIsVerified] = useState(false)

  const { username } = useParams()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleCodeInputChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newInputs = [...codeInputs]
    newInputs[index] = value
    setCodeInputs(newInputs)
    setValue("verifyCode", newInputs.join(""))
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 6) {
      const newInputs = pastedData.split("")
      setCodeInputs(newInputs)
      setValue("verifyCode", pastedData)
      inputRefs.current[5]?.focus()
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setCanResend(false)
    setTimeLeft(60)
    try {
      await API.post("/api/v1/user/get-verification-code", { username })
      setCodeInputs(["", "", "", "", "", ""])
      setValue("verifyCode", "")
      inputRefs.current[0]?.focus()
    } catch (error) {
      console.error("Resend error:", error)
      toast.error("Failed to resend code")
    } finally {
      setIsResending(false)
    }
  }

  const onSubmit = async ({ verifyCode }: EmailVerificationFormData) => {
    setIsLoading(true)
    try {
      const response = await API.post("/api/v1/user/verify-code", {
        username,
        verifyCode,
      })
      toast.success("Verified successfully")
      setIsVerified(true)
      setTimeout(() => {
        navigate("/joinus/login")
      }, 2000)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Email Verified!</CardTitle>
          <CardDescription className="text-gray-600">
            Your email has been successfully verified. You will be redirected shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-gray-600">Redirecting you to your login...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
        <CardDescription className="text-gray-600">
          We've sent a 6-digit verification code to your email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Enter Verification Code</Label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {codeInputs.map((value, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-lg font-semibold ${
                    errors.verifyCode ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
              ))}
            </div>
            {errors.verifyCode && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.verifyCode.message}
              </div>
            )}
            <p className="text-xs text-gray-500 text-center">
              Tip: You can paste the entire code at once
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-orange-400 hover:bg-orange-500 cursor-pointer text-white font-medium"
            disabled={isLoading || codeInputs.join("").length !== 6}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Verifying...
              </div>
            ) : (
              "Verify Code"
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">{"Didn't receive the code?"}</p>
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-500">Resend code in {formatTime(timeLeft)}</p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend Code
                </div>
              )}
            </Button>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Need to use a different email?</p>
            <button
              onClick={() => navigate("/joinus/login")}
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Check your spam folder</p>
              <p>If you don't see the email, please check your spam or junk folder.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
