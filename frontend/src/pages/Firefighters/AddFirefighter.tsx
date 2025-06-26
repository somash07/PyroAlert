import type React from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  addFirefighter,
  deleteFirefighter,
  fetchFirefightersByDepartment,
} from "../../store/slices/firefighterSlice";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface FirefighterFormInputs {
  name: string;
  email: string;
  contact: string;
  departmentId: string;
}

const AddFirefighter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);

  const departmentId = user?._id;
  
    useEffect(
      function fetchFirefirefighters() {
        if (departmentId) dispatch(fetchFirefightersByDepartment(departmentId));
      },
      [dispatch, departmentId]
    );


  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  const [showForm, setShowForm] = useState(false);

  

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FirefighterFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      departmentId: departmentId,
    },
  });
  useEffect(() => {
    if (departmentId) {
      setValue("departmentId", departmentId);
    }
  }, [setValue, departmentId]);

  const onSubmit = async (data: FirefighterFormInputs) => {
    await dispatch(addFirefighter({ ...data, status: "available" as const }));
    await dispatch(fetchFirefightersByDepartment(departmentId)); 
    reset({
      name: "",
      email: "",
      contact: "",
      departmentId: departmentId,
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this firefighter?")) {
      await dispatch(deleteFirefighter(id));
      await dispatch(fetchFirefightersByDepartment(departmentId)); // refresh list after deleting
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Firefighter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Firefighter</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  autoComplete="off"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  autoComplete="off"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Enter a valid email address",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  autoComplete="off"
                  type="tel"
                  {...register("contact", { required: "Contact is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
                {errors.contact && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.contact.message}
                  </p>
                )}
              </div>
              {/* Empty div for spacing */}
              <div></div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Firefighter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(firefighters) && firefighters.map((firefighter) => (
              <tr key={firefighter._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {firefighter.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {firefighter.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {firefighter.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      firefighter.status === "available"
                        ? "bg-green-100 text-green-800"
                        : firefighter.status === "busy"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {firefighter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDelete(firefighter._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddFirefighter;
