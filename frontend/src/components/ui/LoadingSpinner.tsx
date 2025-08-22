import type React from "react"

interface LoadingSpinnerProps {
  size?: number
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24 }) => {
  return (
    <div
      className="border-4 border-gray-700 border-t-green-500 rounded-full animate-spin"
      style={{ width: `${size}px`, height: `${size}px` }}
    ></div>
  )
}
