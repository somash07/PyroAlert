import { useState } from "react";
import { Outlet } from "react-router";
import Nav from "./components/Nav";

function SignupLogin() {
  const [status, setStatus] = useState("register");

  return (
    <div className="h-[100vh] w-screen flex justify-center items-center">
      <div className="flex justify-center mt-20 items-center shadow-md rounded-md h-full w-full">
        <div className="flex px-10 h-full w-full justify-center items-center">
          <img src="/sign-up-login.jpeg" alt="" className="h-[80%] w-[40%] object-cover rounded-md hidden lg:flex" />
        <div className="w-full lg:w-[40%] h-[80%] shadow-lg overflow-hidden ">
            <Nav status={status} setStatus={setStatus} />
            <Outlet/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupLogin;
