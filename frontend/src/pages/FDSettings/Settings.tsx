import type React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import {
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  CogIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"

interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  sound: boolean
  highPriorityOnly: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface DepartmentSettings {
  name: string
  address: string
  phone: string
  emergencyContact: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface ResponseSettings {
  autoAssign: boolean
  maxDistance: number
  responseTimeout: number
  backupDepartment: string
  autoAcceptThreshold: number
  priorityTemperatureThreshold: number
}

interface SystemSettings {
  aiDetectionEnabled: boolean
  confidenceThreshold: number
  cameraMonitoring: boolean
  realTimeAlerts: boolean
  dataRetentionDays: number
  backupFrequency: string
}

const Settings: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const [activeTab, setActiveTab] = useState("department")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

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
  })

  const [department, setDepartment] = useState<DepartmentSettings>({
    name: user?.username || "Central Fire Department",
    address: "123 Fire Station Rd, City, State 12345",
    phone: "+1 (555) 123-4567",
    emergencyContact: "+1 (555) 911-0000",
    email: "central@firedept.gov",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
  })

  const [responseSettings, setResponseSettings] = useState<ResponseSettings>({
    autoAssign: false,
    maxDistance: 10,
    responseTimeout: 5,
    backupDepartment: "North Fire Department",
    autoAcceptThreshold: 0.8,
    priorityTemperatureThreshold: 80,
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    aiDetectionEnabled: true,
    confidenceThreshold: 0.7,
    cameraMonitoring: true,
    realTimeAlerts: true,
    dataRetentionDays: 365,
    backupFrequency: "daily",
  })

  const handleSave = async () => {
    setSaveStatus("saving")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Here you would make actual API calls to save settings
      // await api.saveSettings({ notifications, department, responseSettings, systemSettings })

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const tabs = [
    { id: "department", label: "Department", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "response", label: "Response", icon: ClockIcon },
    { id: "system", label: "System", icon: CogIcon },
  ]

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Configure system preferences, department information, and response settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
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
              )
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
                <h2 className="text-xl font-semibold">Department Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={department.name}
                      onChange={(e) => setDepartment({ ...department, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      value={department.phone}
                      onChange={(e) => setDepartment({ ...department, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={department.email}
                      onChange={(e) => setDepartment({ ...department, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <div className="relative">
                    <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      value={department.emergencyContact}
                      onChange={(e) => setDepartment({ ...department, emergencyContact: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      value={department.address}
                      onChange={(e) => setDepartment({ ...department, address: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={department.coordinates.lat}
                    onChange={(e) =>
                      setDepartment({
                        ...department,
                        coordinates: { ...department.coordinates, lat: Number.parseFloat(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={department.coordinates.lng}
                    onChange={(e) =>
                      setDepartment({
                        ...department,
                        coordinates: { ...department.coordinates, lng: Number.parseFloat(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      <div key={key} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key === "highPriorityOnly" ? "High Priority Only" : `${key} Notifications`}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typeof value === "boolean" ? value : false}
                            onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
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
                      <span className="text-sm font-medium text-gray-700">Enable Quiet Hours</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.quietHours.enabled}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              quietHours: { ...notifications.quietHours, enabled: e.target.checked },
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={notifications.quietHours.start}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                quietHours: { ...notifications.quietHours, start: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            value={notifications.quietHours.end}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                quietHours: { ...notifications.quietHours, end: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Response Settings Tab */}
          {activeTab === "response" && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">Response Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Automatic Response</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Auto-assign incidents</span>
                        <p className="text-xs text-gray-500">
                          Automatically assign available firefighters to new incidents
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={responseSettings.autoAssign}
                          onChange={(e) => setResponseSettings({ ...responseSettings, autoAssign: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-accept Confidence Threshold
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0.5"
                          max="1"
                          step="0.1"
                          value={responseSettings.autoAcceptThreshold}
                          onChange={(e) =>
                            setResponseSettings({
                              ...responseSettings,
                              autoAcceptThreshold: Number.parseFloat(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                          {(responseSettings.autoAcceptThreshold * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically accept incidents with AI confidence above this threshold
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Response Distance (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={responseSettings.maxDistance}
                      onChange={(e) =>
                        setResponseSettings({ ...responseSettings, maxDistance: Number.parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum distance for incident response</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Timeout (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={responseSettings.responseTimeout}
                      onChange={(e) =>
                        setResponseSettings({ ...responseSettings, responseTimeout: Number.parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Time before escalating to backup department</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Temperature Threshold (°C)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="150"
                      value={responseSettings.priorityTemperatureThreshold}
                      onChange={(e) =>
                        setResponseSettings({
                          ...responseSettings,
                          priorityTemperatureThreshold: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Temperature above which incidents are marked as high priority
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Department</label>
                    <select
                      value={responseSettings.backupDepartment}
                      onChange={(e) => setResponseSettings({ ...responseSettings, backupDepartment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="North Fire Department">North Fire Department</option>
                      <option value="South Fire Department">South Fire Department</option>
                      <option value="East Fire Department">East Fire Department</option>
                      <option value="West Fire Department">West Fire Department</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Department to contact if response timeout is reached</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <CogIcon className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">System Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">AI Detection System</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Enable AI Detection</span>
                        <p className="text-xs text-gray-500">Use AI-powered fire and smoke detection</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.aiDetectionEnabled}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, aiDetectionEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Camera Monitoring</span>
                        <p className="text-xs text-gray-500">Monitor camera feeds for fire detection</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.cameraMonitoring}
                          onChange={(e) => setSystemSettings({ ...systemSettings, cameraMonitoring: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Real-time Alerts</span>
                        <p className="text-xs text-gray-500">Send immediate alerts when incidents are detected</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.realTimeAlerts}
                          onChange={(e) => setSystemSettings({ ...systemSettings, realTimeAlerts: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Confidence Threshold</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0.3"
                          max="0.9"
                          step="0.1"
                          value={systemSettings.confidenceThreshold}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              confidenceThreshold: Number.parseFloat(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                          {(systemSettings.confidenceThreshold * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum confidence level required to trigger an alert
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Data Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                      <input
                        type="number"
                        min="30"
                        max="1095"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, dataRetentionDays: Number.parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long to keep incident data</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({ ...systemSettings, backupFrequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">How often to backup system data</p>
                    </div>
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
            })
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
          {saveStatus === "saved" && <CheckCircleIcon className="h-4 w-4 mr-2" />}
          {saveStatus === "error" && <ExclamationTriangleIcon className="h-4 w-4 mr-2" />}
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
            <p className="text-green-800 text-sm">Settings saved successfully!</p>
          </div>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 text-sm">Failed to save settings. Please try again.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
