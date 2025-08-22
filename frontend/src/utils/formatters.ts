import { format, isToday, isYesterday } from "date-fns"

export const formatTimelineDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return "Today"
  }
  if (isYesterday(date)) {
    return "Yesterday"
  }
  return format(date, "MMMM d, yyyy")
}

export const formatMemoryTime = (dateStr: string): string => {
  try {
    let adjustedDateStr = dateStr
    if (!dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.includes("-", 10)) {
      adjustedDateStr = dateStr + "Z"
    }

    const date = new Date(adjustedDateStr)

    if (isNaN(date.getTime())) {
      return ""
    }

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    return formattedTime
  } catch (error) {
    console.error("Error formatting time:", error)
    return ""
  }
}
