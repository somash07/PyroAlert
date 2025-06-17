import  { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, Schema } from "../../../validators/signupValidators.ts";
import ErrorText from "./ErrorText";
import API from "../../../config/baseUrl.ts"
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

function Signup() {
  const navigate= useNavigate();
//   const [userMode, setUserMode] = useState<string>("");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(signupSchema),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });


  const submitData = async(data: FieldValues) => {
    const { username, email, password, type }=data;
   try {
     const {data}= await API.post("/api/v1/user/sign-up", { username, email, password, type })
     navigate(`/otpverify/${username}`)
     toast.success(data.message)
   } catch (error:any){
     toast.error(error.response.data.message)
   }
    reset(); // Reset form after submission
  };

  return (
    <>
        <form
          onSubmit={handleSubmit(submitData)}
          className="flex flex-col h-[100%] p-5 gap-5 justify-center overflow-y-scroll max-h-screen"
        >
          <input
            {...register("email")}
            type="email"
            placeholder="Enter email"
            className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
          />
          {errors.email && (
            <ErrorText message={errors.email.message as string} />
          )}

          <input
            {...register("password")}
            placeholder="Enter Password"
            type="password"
            className="p-3 text-sm text-black rounded-xl bg-gray-100 focus:outline-none"
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

          <Button
            type="submit"
            className={`bg-btnColor px-5 py-2 text-white rounded-lg hover:bg-btnHover`}
          >
            Signup
          </Button>
        </form>
    </>
  );
}

export default Signup;
