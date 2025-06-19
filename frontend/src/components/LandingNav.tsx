import { Fade } from "hamburger-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import NavLinkList from "./LandingNavLinkList";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-screen box-border h-20 flex items-center justify-between px-8 shadow-md fixed top-0 z-50 bg-white">
      {/* logo */}
      <NavLink to="/" className=" flex gap-6 items-center cursor-pointer">
        <img src="/logo.png" alt="" className="h-[130px] " />
      </NavLink>

      {/* mobile menu */}
      <div className="xl:hidden">
        <div className="cursor-pointer hover:text-stone-500">
          <Fade toggled={isOpen} toggle={setIsOpen} />
        </div>

        <div
          className={`absolute right-0 top-16 w-full p-5 transition-all duration-300 ease-in-out z-50
                ${
                  isOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-5 invisible"
                }`}
        >
          <ul className="flex flex-col items-center h-full gap-5 bg-stone-100 p-5 rounded-md shadow-md">
            <NavLinkList />
          </ul>
        </div>
      </div>

      {/* desktop menu */}
      <div className="hidden xl:flex ">
        <ul className="flex items-center gap-9 w-full">
          <NavLinkList />
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
