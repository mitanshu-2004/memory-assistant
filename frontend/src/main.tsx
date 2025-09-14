import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./styles/global.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode> {/* We've removed this wrapper */}
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  // </React.StrictMode>
)