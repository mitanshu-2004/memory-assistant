import type React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export const Layout: React.FC = () => {
  return (
    <div className="saas-container">
      <Sidebar />
      <div className="saas-main">
        <main className="saas-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
