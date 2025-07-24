import type React from "react";
import { useEffect, useState } from "react";
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
import { PencilIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useMemo } from "react";
import type { Firefighter } from "@/types";
import type { UseFormRegisterReturn } from "react-hook-form";
import { DotLoader } from "react-spinners";

type Status = "available" | "busy";

interface FirefighterFormInputs {
  name: string;
  email: string;
  contact: string;
  address: string;
  departmentId: string;
  status: Status;
}

const AddFirefighter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  /* departmentId from localStorage */
  const storedDepartmentId =
    JSON.parse(localStorage.getItem("userInfo") || "{}")?._id || "";

  /* Redux slice */
  const { loading, firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );

  /* local state */
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFirefighter, setEditingFirefighter] =
    useState<Firefighter | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* react‑hook‑form */
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
      status: "available", // ← default
    },
  });

  /* sync departmentId */
  useEffect(() => {
    if (storedDepartmentId) setValue("departmentId", storedDepartmentId);
  }, [storedDepartmentId, setValue]);

  const filteredFirefighters = useMemo(() => {
    if (!searchTerm.trim()) return firefighters;

    const term = searchTerm?.toLowerCase();
    return firefighters.filter(
      (ff) =>
        ff.name?.toLowerCase().includes(term) ||
        ff.email?.toLowerCase().includes(term) ||
        ff.contact?.toLowerCase().includes(term)
    );
  }, [firefighters, searchTerm]);

  /* ───────── Add firefighter ───────── */
  const onSubmit = async (data: FirefighterFormInputs) => {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("contact", data.contact);
      formData.append("address", data.address);
      formData.append("departmentId", storedDepartmentId);
      formData.append("status", "available");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await dispatch(
        addFirefighter(formData) // always available
      ).unwrap();
      await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
      toast("Firefighter added!");
      setShowForm(false);
      reset({
        name: "",
        email: "",
        contact: "",
        address: "",
        departmentId: storedDepartmentId,
        status: "available",
      });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      if (err === "Firefighter email already exists") {
        toast.error("A firefighter with this email already exists.");
      } else {
        toast.error("Something went wrong while adding firefighter.");
      }
    }
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await dispatch(deleteFirefighter(toDeleteId)).unwrap();
      toast.error("Firefighter deleted!");
      await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
    } catch (err: any) {
      // toast.error(err?.message || "Failed to delete firefighter");
    } finally {
      setToDeleteId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = (ff: Firefighter) => {
    setEditingFirefighter(ff);
    setValue("name", ff.name);
    setValue("email", ff.email);
    setValue("contact", ff.contact);
    setValue("address", ff.address);
    setValue("departmentId", ff.departmentId);
    setValue("status", ff.status as Status); // ← seed status
    setShowEditForm(true);
  };

  const handleEditSubmit = async (data: FirefighterFormInputs) => {
    if (!editingFirefighter) return;
    await dispatch(updateFirefighter({ _id: editingFirefighter._id, ...data }));
    toast.success("Firefighter updated!");
    setEditingFirefighter(null);
    setShowEditForm(false);
    reset();
    await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
  };

  /* cancel edit */
  const cancelEdit = () => {
    setEditingFirefighter(null);
    setShowEditForm(false);
    reset();
  };

  return (
    <div>
      {/* header buttons */}
      <div className="mb-6 flex gap-3 items-center w-full">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search name, email, or number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 text-sm rounded-md focus:outline-none"
        />
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setPreviewUrl(null);
          }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Add New Firefighter
        </Button>

        <RefreshCcw
          className="mr-2 h-4 w-4 hover:cursor-pointer text-green-600 ml-auto"
          onClick={async () => {
            await dispatch(fetchFirefightersByDepartment(storedDepartmentId));
            toast.success("Refreshed");
          }}
        />
      </div>

      {/* add‑new form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Firefighter</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* name + email */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                placeholder="Enter full name"
                error={errors.name?.message}
                registration={register("name", {
                  required: "Name is required",
                })}
              />
              <InputField
                label="Email"
                type="email"
                placeholder="Enter email"
                error={errors.email?.message}
                registration={register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email",
                  },
                })}
              />
            </div>
            {/* contact + address */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Contact Number"
                type="tel"
                placeholder="Phone number"
                error={errors.contact?.message}
                registration={register("contact", {
                  required: "Contact is required",
                })}
              />
              <InputField
                label="Address"
                placeholder="Enter address"
                error={errors.address?.message}
                registration={register("address", {
                  required: "Address is required",
                })}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-auto hover:cursor-pointer hover:bg-gray-300 p-4 bg-gray-200 rounded-md"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 h-24 rounded-md"
                  />
                )}
              </div>
            </div>

            {/* buttons */}
            <div className="flex space-x-3">
              <SubmitBtn>
                {loading ? (
                  <DotLoader size={15} color="#ffffff" />
                ) : (
                  "Add Firefighter"
                )}
              </SubmitBtn>
              <CancelBtn
                onClick={() => {
                  setShowForm(false);
                }}
              />
            </div>
          </form>
        </div>
      )}

      {/* edit modal */}
      {showEditForm && (
        <Modal>
          <h3 className="text-lg font-semibold mb-4">Edit Firefighter</h3>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
            {/* name + email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                registration={register("name", { required: true })}
              />
              <InputField
                label="Email"
                type="email"
                registration={register("email", { required: true })}
              />
            </div>

            {/* contact + address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Number"
                type="tel"
                registration={register("contact", { required: true })}
              />
              <InputField
                label="Address"
                registration={register("address", { required: true })}
              />
            </div>

            {/* status selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register("status", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>

            {/* buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <SubmitBtn>
                {loading ? (
                  <DotLoader size={15} color="#ffffff" />
                ) : (
                  "Update Firefighter"
                )}
              </SubmitBtn>
              <CancelBtn onClick={cancelEdit} />
            </div>
          </form>
        </Modal>
      )}

      {/* data table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Email", "Contact", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFirefighters.map((ff) => (
              <tr key={ff._id || ff.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ff.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ff.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ff.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill status={ff.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <button
                    onClick={() => handleEdit(ff)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>

                  {/* delete modal */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={() => setToDeleteId(ff._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        {loading && toDeleteId === ff._id ? (
                          <DotLoader size={15} color="#FF0000" />
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="sm:max-w-[425px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete firefighter?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setToDeleteId(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={confirmDelete}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface InputProps {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  error?: string;
  registration: UseFormRegisterReturn;
}
const InputField: React.FC<InputProps> = ({
  label,
  placeholder,
  type = "text",
  error,
  registration,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      autoComplete="off"
      type={type}
      placeholder={placeholder}
      {...registration}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SubmitBtn: React.FC<React.PropsWithChildren> = ({ children }) => (
  <button
    type="submit"
    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
  >
    {children}
  </button>
);
const CancelBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
  >
    Cancel
  </button>
);

const StatusPill: React.FC<{ status: Status }> = ({ status }) => {
  const styles =
    status === "available"
      ? "bg-green-100 text-green-800"
      : status === "busy"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>
      {status}
    </span>
  );
};

/* simple fixed overlay modal */
const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      {children}
    </div>
  </div>
);

export default AddFirefighter;
