"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store/store"
import { fetchFirefighters } from "../../store/slices/firefighterSlice"
import FirefighterInfo from "./FirefighterInfo"
import AddFirefighter from "./AddFirefighter"

const Firefighters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState<"info" | "manage">("info")

  useEffect(() => {
    dispatch(fetchFirefighters())
  }, [dispatch])

  return (
    <div className="p-6 ">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Firefighters</h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "info"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "manage"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Add/Delete
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "info" ? <FirefighterInfo /> : <AddFirefighter />}
    </div>
  )
}

export default Firefighters
