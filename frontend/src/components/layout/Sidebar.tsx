"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import { Home, PlusCircle, Clock, Folder, Brain, Upload } from "lucide-react"

const mainNavItems = [
  { to: "/", text: "Dashboard", icon: <Home size={20} />, badge: null },
  { to: "/create", text: "Add Memory", icon: <PlusCircle size={20} />, badge: null },
  { to: "/upload", text: "Upload", icon: <Upload size={18} />, badge: null },
  { to: "/timeline", text: "Timeline", icon: <Clock size={20} />, badge: null },
  { to: "/categories", text: "Categories", icon: <Folder size={18} />, count: 12 },
]

export const Sidebar: React.FC = () => {
  return (
    <aside className="saas-sidebar">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MemoryVault</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group ${
                  isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : ""
                }`
              }
            >
              <div className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </div>
              
            </NavLink>
          ))}
        </nav>
      </div>

      
    </aside>
  )
}
