import { NavLink } from "react-router-dom";

function Nav({
  setStatus,
}: {
  status: string;
  setStatus: (status: string) => void;
}) {
  return (
    <nav className="bg-gray-100">
      <ul className="flex w-full justify-between h-[40px] items-center p-5">
        <div className="w-1/2">
          <li
            className="flex-1 flex justify-center border-r-2"
            onClick={() => setStatus("login")}
          >
            <NavLink
              to="login"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-orange-400"
                  : "text-black hover:text-gray-500"
              }
            >
              Login
            </NavLink>
          </li>
        </div>
        <li
          className="flex-1 flex justify-center"
          onClick={() => setStatus("register")}
        >
          <NavLink
            to="register"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-orange-400"
                : "text-black hover:text-gray-500"
            }
          >
            Signup
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
