import { Link } from "react-router-dom";
import { LOGO_URL } from "../utils/constants";
import { useState } from "react";
import { useOnlineStatus } from "../utils/useOnlineStatus";
const Header = () => {
  const [btnLabel, setBtnLabel] = useState("Login");
  const onlineStatus = useOnlineStatus();
  // console.log("Header Rendered");
  return (
    <header className="flex justify-between bg-white shadow-lg p-2 m-2">
      <div className="flex justify-items-end items-center h-12 ">
          <img
            src={LOGO_URL}
            alt="logo"
            className="h-24 w-24 object-contain"
          />
        <nav className="ml-8">
          <ul className="flex items-center gap-8">
            <li
              className={`font-medium ${
                onlineStatus ? "text-green-600" : "text-red-600"
              }`}
            >
              Online Status: {onlineStatus ? "🟢" : "🔴"}
            </li>
            <li>
              <Link to="/" className="font-medium text-black-700 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="font-medium text-black-700 hover:text-gray-900">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="font-medium text-black-700 hover:text-gray-900"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/grocery"
                className="font-medium text-black-700 hover:text-gray-900"
              >
                Grocery
              </Link>
            </li>
            <li className="font-medium text-black-700">Cart</li>
          </ul>
        </nav>
      </div>

      <div>
        <button
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setBtnLabel(btnLabel === "Login" ? "Logout" : "Login")}
        >
          {btnLabel}
        </button>
      </div>
    </header>
  );
};

export default Header;
