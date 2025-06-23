import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";

const NavLinkList = () => {
  return (
    <>
      <div className="flex md:flex-row gap-4 flex-col items-center justify-center self-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "border-b-4" : "hover:text-stone-500"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/about-us"
          className={({ isActive }) =>
            isActive ? "border-b-4" : "hover:text-stone-500"
          }
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "border-b-4" : "hover:text-stone-500"
          }
        >
          Contact us
        </NavLink>
      </div>

      <div className=" flex gap-3 ">
        <NavLink to="/joinus">
          <Button className="cursor-pointer border-1 hover:bg-stone-700">
            Firedepartment Registration
          </Button>
        </NavLink>

        <NavLink to="/client-request">
          <Button className="cursor-pointer bg-orange-400 hover:bg-orange-300">
            Become a client
          </Button>
        </NavLink>
      </div>
    </>
  );
};

export default NavLinkList;
