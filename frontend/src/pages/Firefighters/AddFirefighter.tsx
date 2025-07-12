import type React from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  addFirefighter,
  deleteFirefighter,
  fetchFirefightersByDepartment,
  updateFirefighter,
} from "../../store/slices/firefighterSlice";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import type { Firefighter } from "@/types";
import { PencilIcon, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface FirefighterFormInputs {
  name: string;
  email: string;
  contact: string;
  address: string;
  departmentId: string;
}

const AddFirefighter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  const [showForm, setShowForm] = useState(false);
  const [editingFirefighter, setEditingFirefighter] =
  useState<Firefighter | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

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
      address: "",
      departmentId: storedDepartmentId,
    },
  });
  useEffect(() => {
    if (storedDepartmentId) {
      setValue("departmentId", storedDepartmentId);
    }
  }, [setValue, storedDepartmentId]);

  const onSubmit = async (data: FirefighterFormInputs) => {
    try{
    await dispatch(addFirefighter({ ...data, status: "available" as const })).unwrap();
    await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
    }catch (err: any) {
    const errorMessage =
      typeof err === "string"
        ? err
        : err?.message || "Failed to add firefighter";
    toast.error(errorMessage);
  }
    reset({
      name: "",
      email: "",
      contact: "",
      address: "",
      departmentId: storedDepartmentId,
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this firefighter?")) {
      await dispatch(deleteFirefighter(id));
      await dispatch(fetchFirefightersByDepartment(storedDepartmentId)); // refresh list after deleting
      toast.success("Firefighter deleted successfully!");
    }
  };

  const handleEdit = (firefighter: Firefighter) => {
    setEditingFirefighter(firefighter);
    setValue("name", firefighter.name);
    setValue("email", firefighter.email);
    setValue("contact", firefighter.contact);
    setValue("departmentId", firefighter.departmentId);
    setValue("address", firefighter.address);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (data: FirefighterFormInputs) => {
    if (editingFirefighter) {
      dispatch(updateFirefighter({ _id: editingFirefighter._id, ...data }));
      reset();
      toast.success("Firefighter updated successfully! ");
      setEditingFirefighter(null);
      setShowEditForm(false);
    }
    await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
  };

  const handleCancelEdit = () => {
    setEditingFirefighter(null);
    setShowEditForm(false);
    reset();
  };

  return (
    <div>
      <div className="mb-6 flex gap-5">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Firefighter
        </button>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={async () => {
            await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
            toast.success("Refreshed successfully");
          }}
        >
          <RefreshCcw />
          Refresh
        </Button>
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
                  placeholder="Enter full name"
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
                  placeholder="Enter email address"
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
                  placeholder="Enter phone number"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  placeholder="Enter your address"
                  autoComplete="off"
                  type="text"
                  {...register("address", { required: "Address is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.message}
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

      {showEditForm && editingFirefighter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Firefighter</h3>
              <form
                onSubmit={handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      autoComplete="off"
                      {...register("name", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      autoComplete="off"
                      type="email"
                      {...register("email", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      autoComplete="off"
                      type="tel"
                      {...register("contact", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      autoComplete="off"
                      type="tel"
                      {...register("address", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update Firefighter
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
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
            {Array.isArray(firefighters) &&
              firefighters.map((firefighter) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 lex space-x-2">
                    <button
                      onClick={() => handleEdit(firefighter)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Firefighter"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
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
