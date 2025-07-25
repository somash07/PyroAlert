import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { fetchFirefightersByDepartment } from "@/store/slices/firefighterSlice";

const FirefighterInfo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { firefighters, loading } = useSelector(
    (state: RootState) => state.firefighters
  );
  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  // Fetch firefighters when departmentId is valid
  useEffect(() => {
    dispatch(fetchFirefightersByDepartment(storedDepartmentId));
  }, [storedDepartmentId, dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-red-100 text-red-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-300 rounded"></div>
        ))}
      </div>
    );
  }

  if (!storedDepartmentId) {
    return (
      <div className="text-center text-red-500">
        Department ID missing. Please log in again.
      </div>
    );
  }

  if(firefighters.length === 0 ){
    return <div>
      No fire fighters available 
    </div>
  }
  return (
    <div className="space-y-4">
      {firefighters.map((firefighter) => (
        <div
          key={firefighter._id}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full w-12 h-12 overflow-hidden flex items-center justify-center">
                {firefighter.image ? (
                  <img
                    src={`${firefighter.image}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {firefighter.name}
                </h3>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                firefighter.status
              )}`}
            >
              {firefighter.status.charAt(0).toUpperCase() +
                firefighter.status.slice(1)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <a
                href={`mailto:${firefighter.email}`}
                className="text-sm text-gray-600 hover:text-blue-500 cursor-pointer"
              >
                {firefighter.email}
              </a>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <a
                href={`tel:${firefighter.contact}`}
                className="text-sm text-gray-600 hover:text-blue-500"
              >
                {firefighter.contact}
              </a>
            </div>
            <div className="flex items-center">
              <MapIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {firefighter.address}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FirefighterInfo;
