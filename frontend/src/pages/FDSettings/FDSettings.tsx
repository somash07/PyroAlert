import type React from "react";
import { useState } from "react";
import {
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import API from "@/config/baseUrl";

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  sound: boolean;
  highPriorityOnly: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface DepartmentSettings {
  username: string;
  password: string;
  phone?: string;
  emergencyContact?: string;
  email: string;
  lat: number;
  lng: number;
}

const FDSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("department");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const storedUserRaw = localStorage.getItem("userInfo");
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : undefined;

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: true,
    push: true,
    sound: true,
    highPriorityOnly: false,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "06:00",
    },
  });

  const [department, setDepartment] = useState<DepartmentSettings>({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    password: "",
    phone: "",
    emergencyContact: "",
    lat: storedUser.lat,
    lng: storedUser.lng,
  });

  const tabs = [
    { id: "department", label: "Department", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
  ];

  const handleSave = async () => {
    setSaveStatus("saving");

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.put(
        "/api/v1/user/departments/settings",
        {
          username: department.username,
          email: department.email,
          password: department.password,
          lat: department.lat,
          lng: department.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optional: update localStorage
      if (data?.data) {
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Configure system preferences, department information, and response
          settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Department Information Tab */}
          {activeTab === "department" && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">
                  Department Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={department.username}
                      onChange={(e) =>
                        setDepartment({
                          ...department,
                          username: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      value={department.phone}
                      onChange={(e) =>
                        setDepartment({ ...department, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={department.email}
                      onChange={(e) =>
                        setDepartment({ ...department, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={department.password}
                      onChange={(e) =>
                        setDepartment({
                          ...department,
                          password: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={department.lat}
                    onChange={(e) =>
                      setDepartment({
                        ...department,
                        lat: Number.parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={department.lng}
                    onChange={(e) =>
                      setDepartment({
                        ...department,

                        lng: Number.parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <BellIcon className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">Notification Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Alert Types</h3>
                  {Object.entries(notifications)
                    .filter(([key]) => !key.includes("quietHours"))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key === "highPriorityOnly"
                            ? "High Priority Only"
                            : `${key} Notifications`}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typeof value === "boolean" ? value : false}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                [key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Quiet Hours</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Enable Quiet Hours
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.quietHours.enabled}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              quietHours: {
                                ...notifications.quietHours,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {notifications.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={notifications.quietHours.start}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                quietHours: {
                                  ...notifications.quietHours,
                                  start: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={notifications.quietHours.end}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                quietHours: {
                                  ...notifications.quietHours,
                                  end: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            // Reset to default values
            setNotifications({
              email: true,
              sms: true,
              push: true,
              sound: true,
              highPriorityOnly: false,
              quietHours: { enabled: false, start: "22:00", end: "06:00" },
            });
          }}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>

        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`px-6 py-2 rounded-md transition-colors flex items-center ${
            saveStatus === "saving"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : saveStatus === "saved"
              ? "bg-green-600 text-white"
              : saveStatus === "error"
              ? "bg-red-600 text-white"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {saveStatus === "saving" && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {saveStatus === "saved" && (
            <CheckCircleIcon className="h-4 w-4 mr-2" />
          )}
          {saveStatus === "error" && (
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
          )}
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "Saved!"
            : saveStatus === "error"
            ? "Error!"
            : "Save Settings"}
        </button>
      </div>

      {/* Status Messages */}
      {saveStatus === "saved" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800 text-sm">
              Settings saved successfully!
            </p>
          </div>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 text-sm">
              Failed to save settings. Please try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FDSettings;
