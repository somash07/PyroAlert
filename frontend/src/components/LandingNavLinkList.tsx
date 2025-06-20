import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";

const NavLinkList = () => {
  return (
    <>
      <NavLink
        to="/home"
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
      <div className="flex md:flex-row gap-4 flex-col items-center justify-center">
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "border-b-4" : "hover:text-stone-500"
          }
        >
          Contact us
        </NavLink>
      </div>

      <NavLink to="/joinus">
        <Button className="cursor-pointer bg-orange-400 hover:bg-orange-300">
          Join Us
        </Button>
      </NavLink>

      <NavLink to="/client-request">
        <Button className="cursor-pointer bg-orange-400 hover:bg-orange-300">
          Become a client
        </Button>
      </NavLink>
    </>
  );
};

export default NavLinkList;
