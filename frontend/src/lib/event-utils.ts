export const getStatusDisplay = (status: string) => {
  const s = status.toUpperCase();
  if (s === "REGISTRATION_OPEN") return { text: "Registration Open", color: "bg-[#22D46B]/15 text-[#22D46B] border-[#22D46B]/30" };
  if (s === "REGISTRATION_CLOSED") return { text: "Registration Closed", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
  if (s === "COMPLETED") return { text: "Completed", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
  if (s === "ONGOING") return { text: "Ongoing", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  if (s === "UPCOMING") return { text: "Upcoming", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" };
  if (s === "DRAFT") return { text: "Draft", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
  if (s === "PUBLISHED") return { text: "Coming Soon", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  
  return { text: status.replace("_", " "), color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
};
